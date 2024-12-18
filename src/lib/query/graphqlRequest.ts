import axios from 'axios'
import { DocumentNode } from 'graphql/language/ast'
import * as https from 'https'

const NODE_ENV = Bun.env.NODE_ENV ?? 'PRODUCTION'
const DB_HOST = Bun.env.DB_HOST ?? ''

interface Payload<V> {
  query: DocumentNode
  variables: V
  token: string
}

export default async function graphqlRequest<T, V>({ query: doc, variables /*token = ''*/ }: Payload<V>) {
  try {
    const query = doc.loc && doc.loc.source.body
    const res = await axios(DB_HOST, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      headers: {
        // auth: token,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      data: {
        /** FIXME
         * Put your query here to find a valid user and get their data.
         * We are comparing the password through JWT \@auth rules not in any filter of the query
         */
        query,
        variables,
      },
    })

    const errors = (res?.data?.errors as unknown[]) || []

    if (errors?.length) {
      console.log('ERROR IN:', query)
      console.error(JSON.stringify(errors, null, 2))
      console.log('VARIABLES:', JSON.stringify(variables, null, 2))
    } else {
      if (NODE_ENV === 'development') {
        // console.log("SUCCESS IN:", query)
        // console.log("VARIABLES:", JSON.stringify(variables, null, 2))
        // console.log("DATA:", JSON.stringify(res?.data?.data, null, 2))
      }
    }

    return {
      data: res?.data?.data as T,
      errors,
    }
  } catch (error) {
    console.error(error)
    return { data: null, errors: [error] }
  }
}
