import gql from 'graphql-tag'
import { ExternalAPIObject, Payload } from '../types'
import { parsePetRole, PetGender } from './petpass'
import graphqlRequest from './query/graphqlRequest'

import {
  E360App_shop_channel,
  E360App_shop_operationRef,
  E360App_shop_paymentMethod,
  E360App_shop_productRef,
  E360App_shop_productStatus,
  E360App_shop_productStockType,
  E360App_shop_promotionCodeRef,
  E360App_shop_promotionType,
  E360App_shop_purchaseDiscountType,
  E360App_shop_purchaseProviderEventRef,
  E360App_shop_purchaseStatus,
  e360App_shop_taxType,
  e360App_shop_taxValueType,
  E360App_shopRef,
  E360App_userRef,
  Exact,
  InputMaybe,
  PETPASS_productType,
  PETPASS_purchaseRef,
  Scalars,
} from './graph-types'

const EXTERNAL_API_OBJECT = Bun.env.EXTERNAL_API_OBJECT ?? ''

const petpassApp = JSON.parse(Buffer.from(EXTERNAL_API_OBJECT, 'base64').toString('utf-8')) as ExternalAPIObject

export const getData = (payload: Payload) => {
  const { purchaseGUID, purchaseDate } = payload
  //basicData
  const { name, lastName, secondLastName, email, phone, acceptPrivacyPolicy } = payload
  //contractData
  const { roadType, address, addressNumber, addressInfo, city, postalCode, dni, birthDate, providerName = '', companyName, companyDocumentId } = payload
  //petData
  const { petType, petName, motherBreed, fatherBreed, fatherBreedGUID, mixedBreed, motherBreedGUID, dateOfBirth, microchip } = payload
  const role = parsePetRole(payload.role ?? '')
  const gender = payload.gender === 'FEMALE' ? PetGender.FEMALE : PetGender.MALE
  //acceptanceData
  const { confirmRealData } = payload

  const productGUID = payload.productGUID

  const basicData = { name, lastName, secondLastName, email, phone, acceptPrivacyPolicy }
  const contractData = { roadType, address, addressNumber, addressInfo, city, postalCode, dni, birthDate, providerName, companyName, companyDocumentId }
  const petData = { petType, petName, motherBreed, fatherBreed, fatherBreedGUID, mixedBreed, motherBreedGUID, dateOfBirth, microchip, role, gender }
  const acceptData = { confirmRealData }

  const customerData = {
    ...basicData,
    ...contractData,
    ...petData,
    ...acceptData,
  }
  const customerDataRaw = JSON.stringify(customerData)

  return { ...petpassApp, productGUID, purchaseGUID, purchaseDate, ...customerData, customerDataRaw }
}

export const getPassProductData = async (productGUID: string, petpassPartnerGUID = 'x', promoCode = 'x') => {
  const { data } = await graphqlRequest<GetPetpassProductQuery, GetPetpassProductQueryVariables>({
    query: GetPetpassProductDocument,
    variables: {
      guid: productGUID,
      partnerGuid: petpassPartnerGUID || 'x',
      code: promoCode || 'x',
    },
    token: '',
  })

  // if (!data?.getPETPASS_product) {
  //   return  // { message: 'Product not found' }
  // }
  return data
}

export function calculateValuesByPromo({
  price,
  appProductTaxValue,
  petpassProduct,
  promo,
}: {
  price: number
  appProductTaxValue: number
  petpassProduct: GetPetpassProductQuery['getPETPASS_product']
  promo: GetPetpassProductQuery['getE360App_shop_promotionCode']
}) {
  if (!promo || promo.discountType === E360App_shop_purchaseDiscountType.NONE) {
    return {
      discount: 0,
      discountType: E360App_shop_purchaseDiscountType.NONE,
      discountValue: 0,
      cost: price,
      costTaxValue: price - price / 1.21,
    }
  }

  const promoProduct = promo.promotion.promoProducts?.find((p) => p.product.petpassProduct?.guid === petpassProduct?.guid)

  if (promoProduct) {
    const promoProductCurrentPrice = promoProduct ? promoProduct.product.price : 0
    const promoProductDiscountType = promoProduct ? promoProduct.discountType : E360App_shop_purchaseDiscountType.NONE
    const promoProductDiscount = promoProduct ? promoProduct.discount : 0

    let promoProductDiscountValue = 0
    let promoProductNewPrice = 0

    switch (promoProductDiscountType) {
      case E360App_shop_purchaseDiscountType.PERCENTAGE:
        promoProductDiscountValue = (promoProductCurrentPrice * promoProductDiscount) / 100
        promoProductNewPrice = promoProductCurrentPrice - promoProductDiscountValue
        break
      case E360App_shop_purchaseDiscountType.VALUE:
        promoProductDiscountValue = promoProductDiscount
        promoProductNewPrice = promoProductCurrentPrice - promoProductDiscount
        break
      case E360App_shop_purchaseDiscountType.SPECIAL_PRICE:
        promoProductDiscountValue = promoProductCurrentPrice - promoProductDiscount
        promoProductNewPrice = promoProductDiscount
        break
      default:
        break
    }

    const promoProductCost = promo.type === E360App_shop_promotionType.DISCOUNT ? promoProductNewPrice : promoProductCurrentPrice
    const promoCostTaxValue = promoProductCost - promoProductCost / 1.21

    return {
      discount: promoProductDiscount,
      discountType: promoProductDiscountType,
      discountValue: promoProductDiscountValue,
      cost: promo.type === E360App_shop_promotionType.DISCOUNT ? promoProductNewPrice : price,
      costTaxValue: promoCostTaxValue,
    }
  }

  // El descuento debe calcularese sobre el precio neto, es decir, sin impuestos
  // 5995 * 1.21 = 7253.95
  // 7253.95 - 5995 = 1268.95

  const discount = promo.discount
  const discountType = promo.discountType
  const netPrice = price / 1.21

  const discountValue = Math.round(discountType === E360App_shop_purchaseDiscountType.PERCENTAGE ? (netPrice * discount) / 100 : discount)

  if (promo.type === E360App_shop_promotionType.DISCOUNT) {
    return {
      discount,
      discountType,
      discountValue,
      cost: price - discountValue,
      costTaxValue: price - discountValue - (price - discountValue) / 1.21,
    }
  }

  return {
    discount,
    discountType,
    discountValue,
    cost: price,
    costTaxValue: price - price / 1.21,
  }
}

/*tipos-operacion*/
export type GetPetpassProductQueryVariables = Exact<{
  guid: Scalars['String']
  partnerGuid: Scalars['String']
  code: Scalars['String']
}>

export type GetPetpassProductQuery = {
  __typename?: 'Query'
  getPETPASS_product?: {
    __typename?: 'PETPASS_product'
    id: string
    guid: string
    type: PETPASS_productType
    product?: {
      __typename?: 'E360App_shop_product'
      id: string
      guid: string
      name: string
      price: number
      sku?: string | null
      status: E360App_shop_productStatus
      stockType: E360App_shop_productStockType
      stripeProductID?: string | null
      taxType: e360App_shop_taxType
      taxValueType: e360App_shop_taxValueType
      taxValue: number
      shop: { __typename?: 'E360App_shop'; id: string; guid: string }
    } | null
  } | null
  getPETPASS_partner?: {
    __typename?: 'PETPASS_partner'
    id: string
    guid: string
    partner: { __typename?: 'E360App_partner'; id: string; guid: string; name: string }
  } | null
  getE360App_shop_promotionCode?: {
    __typename?: 'E360App_shop_promotionCode'
    guid: string
    code: string
    type: E360App_shop_promotionType
    discount: number
    discountType: E360App_shop_purchaseDiscountType
    promotion: {
      __typename?: 'E360App_shop_promotion'
      id: string
      guid: string
      products: Array<{
        __typename?: 'E360App_shop_product'
        id: string
        guid: string
        price: number
        petpassProduct?: { __typename?: 'PETPASS_product'; id: string; guid: string } | null
      }>
      promoProducts?: Array<{
        __typename?: 'E360App_shop_promoProduct'
        id: string
        guid: string
        discount: number
        discountType: E360App_shop_purchaseDiscountType
        product: {
          __typename?: 'E360App_shop_product'
          id: string
          guid: string
          price: number
          petpassProduct?: { __typename?: 'PETPASS_product'; id: string; guid: string } | null
        }
      }> | null
    }
  } | null
}

export const CreatePurchaseFromPartnerDocument = gql`
  mutation CreatePurchaseFromPartner($input: [AddE360App_shop_purchaseInput!]!) {
    addE360App_shop_purchase(input: $input) {
      numUids
      e360App_shop_purchase {
        id
        guid
      }
    }
  }
`
const GetPetpassProductDocument = gql`
  query GetPetpassProduct($guid: String!, $partnerGuid: String!, $code: String!) {
    getPETPASS_product(guid: $guid) {
      id
      guid
      type
      product {
        id
        guid
        name
        price
        sku
        status
        stockType
        stripeProductID
        taxType
        taxValueType
        taxValue
        shop {
          id
          guid
        }
      }
    }
    getPETPASS_partner(guid: $partnerGuid) {
      id
      guid
      partner {
        id
        guid
        name
      }
    }
    getE360App_shop_promotionCode(code: $code) {
      guid
      code
      type
      discount
      discountType
      promotion {
        id
        guid
        products {
          id
          guid
          price
          petpassProduct {
            id
            guid
          }
        }
        promoProducts {
          id
          guid
          discount
          discountType
          product {
            id
            guid
            price
            petpassProduct {
              id
              guid
            }
          }
        }
      }
    }
  }
`
export type CreatePurchaseFromPartnerMutation = {
  __typename?: 'Mutation'
  addE360App_shop_purchase?: {
    __typename?: 'AddE360App_shop_purchasePayload'
    numUids?: number | null
    e360App_shop_purchase?: Array<{ __typename?: 'E360App_shop_purchase'; id: string; guid: string } | null> | null
  } | null
}
export type CreatePurchaseFromPartnerMutationVariables = Exact<{
  input: Array<AddE360App_shop_purchaseInput> | AddE360App_shop_purchaseInput
}>

export type AddE360App_shop_purchaseInput = {
  canceledAt?: InputMaybe<Scalars['DateTime']>
  channel?: InputMaybe<E360App_shop_channel>
  cost: Scalars['Int']
  createBy?: InputMaybe<E360App_userRef>
  createdAt: Scalars['DateTime']
  customer?: InputMaybe<E360App_userRef>
  customerAddress?: InputMaybe<Scalars['String']>
  customerAddressInfo?: InputMaybe<Scalars['String']>
  customerAddressNumber?: InputMaybe<Scalars['String']>
  customerAddressType?: InputMaybe<Scalars['String']>
  customerBirthDate?: InputMaybe<Scalars['DateTime']>
  customerCity?: InputMaybe<Scalars['String']>
  customerCompany?: InputMaybe<Scalars['String']>
  customerCompanyDocumentId?: InputMaybe<Scalars['String']>
  customerCountry?: InputMaybe<Scalars['String']>
  customerDataRaw?: InputMaybe<Scalars['String']>
  customerDocumentId?: InputMaybe<Scalars['String']>
  customerEmail?: InputMaybe<Scalars['String']>
  customerLastName?: InputMaybe<Scalars['String']>
  customerName?: InputMaybe<Scalars['String']>
  customerPartnerMemberId?: InputMaybe<Scalars['String']>
  customerPhone?: InputMaybe<Scalars['String']>
  customerSecondLastName?: InputMaybe<Scalars['String']>
  customerState?: InputMaybe<Scalars['String']>
  customerZipCode?: InputMaybe<Scalars['String']>
  date: Scalars['DateTime']
  discount: Scalars['Int']
  discountType: E360App_shop_purchaseDiscountType
  discountValue: Scalars['Int']
  failedAt?: InputMaybe<Scalars['DateTime']>
  guid: Scalars['String']
  isTest?: InputMaybe<Scalars['Boolean']>
  metaadataIP?: InputMaybe<Scalars['String']>
  metadataAccuracyType?: InputMaybe<Scalars['String']>
  metadataCity?: InputMaybe<Scalars['String']>
  metadataCountry?: InputMaybe<Scalars['String']>
  metadataLat?: InputMaybe<Scalars['Float']>
  metadataLon?: InputMaybe<Scalars['Float']>
  metadataOrigin?: InputMaybe<Scalars['String']>
  metadataPlatform?: InputMaybe<Scalars['String']>
  metadataRegion?: InputMaybe<Scalars['String']>
  metadataTimezone?: InputMaybe<Scalars['String']>
  metadataUrl?: InputMaybe<Scalars['String']>
  operations: Array<E360App_shop_operationRef>
  paidAt?: InputMaybe<Scalars['DateTime']>
  paymentMethod?: InputMaybe<E360App_shop_paymentMethod>
  petpassPurchase?: InputMaybe<PETPASS_purchaseRef>
  products: Array<E360App_shop_productRef>
  promotionCode?: InputMaybe<E360App_shop_promotionCodeRef>
  providerEvents: Array<E360App_shop_purchaseProviderEventRef>
  redsysMerchantIdentifier?: InputMaybe<Scalars['String']>
  redsysOrderId?: InputMaybe<Scalars['String']>
  refundedAt?: InputMaybe<Scalars['DateTime']>
  shop: E360App_shopRef
  status: E360App_shop_purchaseStatus
  stripeCheckoutSessionID?: InputMaybe<Scalars['String']>
  stripePaymentIntentID?: InputMaybe<Scalars['String']>
  taxPercentage: Scalars['Int']
  taxType?: InputMaybe<e360App_shop_taxType>
  taxValue: Scalars['Int']
  taxValueType?: InputMaybe<e360App_shop_taxValueType>
  total: Scalars['Int']
  user?: InputMaybe<E360App_userRef>
  ux?: InputMaybe<Scalars['String']>
}
