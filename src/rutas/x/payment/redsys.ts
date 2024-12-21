import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { payloadSchema } from './zschemas'

import { zValidator } from '@hono/zod-validator'
import gql from 'graphql-tag'
import graphqlRequest from '@lib/query/graphqlRequest'
import { E360App_shop_purchasePatch, E360App_shop_purchaseStatus, Exact, Scalars } from '@lib/graph-types'
import { createGUID } from '@lib/cripto'
// import { getData } from './lib/data'

const app = new Hono()

const valida = zValidator('json', payloadSchema, (result, c) => {
  if (!result.success) {
    return c.text('Json invalido!', 400)
  }
})

app.post('/purchase/:id', valida, async (c) => {
  const purchaseGUID = c.req.query('id')
  // const purchaseGUID = query.guid as string

  if (!purchaseGUID) {
    console.error('PURCHASE_GUID_NOT_FOUND')
    throw new HTTPException(400, { message: 'Identificador erróneo' })
  }

  const { data } = await graphqlRequest<GetPurchaseQuery, GetPurchaseQueryVariables>({
    query: GetPurchaseDocument,
    variables: { guid: purchaseGUID },
    token: '',
  })

  const purchase = data?.getE360App_shop_purchase

  if (!purchase) {
    console.error('PURCHASE_NOT_FOUND')
    throw new HTTPException(401, { message: 'Compra no encontrada' })
  }

  const purchaseStatus = purchase.status

  if (purchaseStatus === E360App_shop_purchaseStatus.PAID || purchaseStatus === E360App_shop_purchaseStatus.REFUNDED) {
    console.error('ALREADY_PAID_OR_REFUNDED')
    return c.text('Pago ya realizado')
  }

  const promoCode = purchase.promotionCode
  const partner = promoCode ? promoCode.partner : null
  const code = promoCode ? promoCode.code : '-'
  const partnerName = partner ? partner.name : '-'

  await graphqlRequest<UpdatePurchaseMutation, UpdatePurchaseMutationVariables>({
    query: UpdatePurchaseDocument,
    variables: {
      guid: purchaseGUID,
      set: {
        status: E360App_shop_purchaseStatus.PAID,
        paidAt: new Date().toISOString(),
        providerEvents: [
          {
            createdAt: new Date().toISOString(),
            data: '',
            event: 'PAID',
            guid: createGUID(),
            providerName: 'REDSYS',
            status: E360App_shop_purchaseStatus.PAID,
          },
        ],
      },
    },
    token: '',
  })

  await SentInternalEmail({
    fromName: 'Compras',
    to: 'altas@petpass.pro',
    subject: `[PAGADA] compra ${purchaseGUID} ${purchaseGUID} ${code ? `code: ${code}` : ''}  ${partner ? `partner: ${partner}` : ''}`,
    title: `Compra ${purchaseGUID}`,
    items: [
      {
        name: 'Código promocional',
        value: code,
      },
      {
        name: 'Partner',
        value: partnerName,
      },
      {
        name: 'Fecha',
        value: new Date().toLocaleString(),
      },
      {
        name: 'GUID',
        value: purchaseGUID,
      },
    ],
  })

  return c.redirect('https://petpass.pro/payment/success')
})

export default app

// export async function PaymentRedsysNotificationService(req: ExternalAPIRequest, res: Response) {
//   try {
//   } catch (error) {
//     console.error('ERROR', error)
//     return res.status(500).send('Ocurrió un error al procesar el pago')
//   }
// }

const GetPurchaseDocument = gql`
  query GetPurchase($guid: String!) {
    getE360App_shop_purchase(guid: $guid) {
      id
      guid
      status
      customer {
        id
        guid
      }
      promotionCode {
        id
        code
        partner {
          id
          name
        }
      }
    }
  }
`
type GetPurchaseQuery = {
  __typename?: 'Query'
  getE360App_shop_purchase?: {
    __typename?: 'E360App_shop_purchase'
    id: string
    guid: string
    status: E360App_shop_purchaseStatus
    customer?: { __typename?: 'E360App_user'; id: string; guid: string } | null
    promotionCode?: {
      __typename?: 'E360App_shop_promotionCode'
      id: string
      code: string
      partner?: { __typename?: 'E360App_partner'; id: string; name: string } | null
    } | null
  } | null
}

type GetPurchaseQueryVariables = Exact<{
  guid: Scalars['String']
}>

type UpdatePurchaseMutation = {
  __typename?: 'Mutation'
  updateE360App_shop_purchase?: {
    __typename?: 'UpdateE360App_shop_purchasePayload'
    e360App_shop_purchase?: Array<{ __typename?: 'E360App_shop_purchase'; id: string; guid: string; status: E360App_shop_purchaseStatus } | null> | null
  } | null
}

export type UpdatePurchaseMutationVariables = Exact<{
  guid: Scalars['String']
  set: E360App_shop_purchasePatch
}>

export const UpdatePurchaseDocument = gql`
  mutation UpdatePurchase($guid: String!, $set: E360App_shop_purchasePatch!) {
    updateE360App_shop_purchase(input: { filter: { guid: { eq: $guid } }, set: $set }) {
      e360App_shop_purchase {
        id
        guid
        status
      }
    }
  }
`

type Tmessage = {
  fromName: string
  to: string
  subject: string
  title: string
  items: { name: string; value: string }[]
}

const SentInternalEmail = async (message: Tmessage) => ({ success: true, message })
