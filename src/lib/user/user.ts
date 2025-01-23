import { AddUserInput, E360App_userStatus, Exact, Scalars, TwoFactorType } from '@lib/graph-types'
import graphqlRequest from '@lib/query/graphqlRequest'
import gql from 'graphql-tag'

type CreateUserMutationVariables = Exact<{
  input: Array<AddUserInput> | AddUserInput
}>

export type GetUserQueryVariables = Exact<{
  email: Scalars['String']
  e360AppGUID: Scalars['String']
}>

type CreateUserMutation = {
  __typename?: 'Mutation'
  addUser?: {
    __typename?: 'AddUserPayload'
    numUids?: number | null
    user?: Array<{
      __typename?: 'User'
      id: string
      e360Apps?: Array<{ __typename?: 'E360App_user'; id: string; guid: string; petpassUser?: { __typename?: 'PETPASS_user'; id: string; guid: string } | null }> | null
    } | null> | null
  } | null
}

type GetUserQuery = {
  __typename?: 'Query'
  getUser?: {
    __typename?: 'User'
    id: string
    email: string
    userName: string
    crypto?: string | null
    isDisabled: boolean
    isDeleted: boolean
    isTwoFactor: boolean
    twoFactorType?: TwoFactorType | null
    e360Apps?: Array<{
      __typename?: 'E360App_user'
      id: string
      guid: string
      status: E360App_userStatus
      e360App?: { __typename?: 'E360App'; id: string; guid: string } | null
      petpassUser?: { __typename?: 'PETPASS_user'; id: string; guid: string } | null
    }> | null
  } | null
}

const GetUserDocument = gql`
  query GetUser($email: String!, $e360AppGUID: String!) {
    getUser(email: $email) {
      id
      email
      userName
      crypto
      isDisabled
      isDeleted
      isTwoFactor
      twoFactorType
      e360Apps @cascade(fields: ["e360App"]) {
        id
        guid
        status
        e360App(filter: { guid: { eq: $e360AppGUID } }) {
          id
          guid
        }
        petpassUser {
          id
          guid
        }
      }
    }
  }
`

const CreateUserDocument = gql`
  mutation CreateUser($input: [AddUserInput!]!) {
    addUser(input: $input) {
      numUids
      user {
        id
        e360Apps {
          id
          guid
          petpassUser {
            id
            guid
          }
        }
      }
    }
  }
`

// Si existe devuelve el usuario, si no se crea
export async function getUserByEmail(email: string, e360AppGUID: string, vv: CreateUserMutationVariables) {
  try {
    const { data } = await graphqlRequest<GetUserQuery, GetUserQueryVariables>({
      query: GetUserDocument,
      variables: { email, e360AppGUID },
      token: '',
    })

    if (data?.getUser) {
      const currentUser = data.getUser
      const e360AppUser = currentUser.e360Apps ? currentUser.e360Apps[0] : null
      const petpassUserGUID = e360AppUser ? e360AppUser.petpassUser?.guid : null

      return {
        e360AppUserGUID: e360AppUser?.guid,
        petpassUserGUID: petpassUserGUID,
        email: currentUser.email,
      }
    }

    const result = await graphqlRequest<CreateUserMutation, CreateUserMutationVariables>({
      query: CreateUserDocument,
      variables: vv,
      token: '',
    })

    if (!result.data?.addUser?.user || !result.data.addUser.user[0]) {
      return null
    }

    const newUser = result.data.addUser.user[0]
    const newe360AppUser = newUser.e360Apps ? newUser.e360Apps[0] : null
    const newPetpassUserGUID = newe360AppUser ? newe360AppUser.petpassUser?.guid : null

    if (!newPetpassUserGUID || !newe360AppUser) {
      return null
    }

    return {
      e360AppUserGUID: newe360AppUser.guid,
      petpassUserGUID: newPetpassUserGUID,
      email,
    }
  } catch (error) {
    console.error(error)
    return null
  }
}
