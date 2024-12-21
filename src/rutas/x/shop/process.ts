import { Payload } from './types'
import { createGUID } from '@lib/cripto'
import {
  calculateValuesByPromo,
  CreatePurchaseFromPartnerDocument,
  CreatePurchaseFromPartnerMutation,
  CreatePurchaseFromPartnerMutationVariables,
  getPassProductData,
  petpassApp,
} from '@lib/data'
import { E360App_shop_channel, E360App_shop_purchaseStatus, PetGender } from '@lib/graph-types'
import { parsePetRole } from '@lib/petpass'
import graphqlRequest from '@lib/query/graphqlRequest'

export const createPurchase = async (payload: Payload) => {
  const data = await getPassProductData(payload.productGUID, payload.partnerGUID, payload.promoCode)
  const promo = data?.getE360App_shop_promotionCode
  const petpassPartner = data?.getPETPASS_partner
  // const partner = petpassPartner ? petpassPartner.partner : null
  // const partnerName = partner ? partner.name : null

  const petpassProduct = data?.getPETPASS_product
  // const petpassProductType = petpassProduct?.type
  const appProduct = petpassProduct?.product
  const appProductPrice = appProduct?.price ?? 0
  // const appProductName = appProduct?.name
  const appShopGUID = appProduct?.shop.guid
  const appProductTaxValue = appProduct?.taxValue ?? 0
  const appProductTaxValueType = appProduct?.taxValueType // Percentage or fixed
  const appProductTaxType = appProduct?.taxType // Included or excluded

  const { discount, discountType, discountValue, cost, costTaxValue } = calculateValuesByPromo({ price: appProductPrice, appProductTaxValue, promo, petpassProduct })

  // Calculamos el valor del impuesto sobre el precio del producto
  // Calculamos el precio final del producto
  // Si el impuesto está incluido en el precio, el costo total es igual al costo del producto
  // Si el impuesto no está incluido en el precio, el costo total es igual al costo del producto más el valor del impuesto
  const total = cost
  // const taxPercentage = appProductTaxValue

  // Tax is included in the price

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

  // return {
  //   purchaseGUID,
  //   purchaseDate,
  //   promo,
  //   petpassPartner,
  //   partner,
  //   partnerName,

  //   petpassProduct,
  //   petpassProductType,
  //   appProduct,
  //   appProductPrice,
  //   appProductName,
  //   appShopGUID,
  //   appProductTaxValue,
  //   appProductTaxValueType,
  //   appProductTaxType,

  //   total,
  //   taxPercentage,

  //   discount,
  //   discountType,
  //   discountValue,
  //   cost,
  //   costTaxValue,
  //   name,
  //   lastName,
  //   secondLastName,
  //   email,
  //   phone,
  //   acceptPrivacyPolicy,
  //   roadType,
  //   address,
  //   addressNumber,
  //   addressInfo,
  //   city,
  //   postalCode,
  //   dni,
  //   birthDate,
  //   providerName,
  //   companyName,
  //   companyDocumentId,
  //   petType,
  //   petName,
  //   motherBreed,
  //   fatherBreed,
  //   fatherBreedGUID,
  //   mixedBreed,
  //   motherBreedGUID,
  //   dateOfBirth,
  //   microchip,
  //   role,
  //   gender,
  //   confirmRealData,
  //   customerDataRaw,
  // petpassAppGUID: petpassApp.petPassAppGUID,
  //   petpassPartner,
  // }

  console.log('Creating purchase', purchaseGUID)

  const result = await graphqlRequest<CreatePurchaseFromPartnerMutation, CreatePurchaseFromPartnerMutationVariables>({
    query: CreatePurchaseFromPartnerDocument,
    variables: {
      input: [
        {
          shop: { guid: appShopGUID },
          guid: purchaseGUID,
          date: purchaseDate,
          products: [{ guid: payload.productGUID }],
          createdAt: purchaseDate,
          cost: Math.round(cost),
          //BasicData
          customerName: name,
          customerLastName: lastName,
          customerSecondLastName: secondLastName,
          customerEmail: email,
          customerPhone: phone,
          customerCountry: 'España',
          providerEvents: [
            {
              createdAt: purchaseDate,
              data: JSON.stringify({
                name,
                lastName,
                secondLastName,
                email,
                phone,
                acceptPrivacyPolicy,
              }),
              event: 'BASIC_DATA',
              guid: createGUID(),
              providerName: providerName,
              status: E360App_shop_purchaseStatus.PENDING,
            },
            {
              createdAt: purchaseDate,
              data: JSON.stringify({
                roadType,
                address,
                addressNumber,
                addressInfo,
                city,
                postalCode,
                dni,
                birthDate,
                companyName,
                companyDocumentId,
              }),
              event: 'CONTRACT_DATA_SAVED',
              guid: createGUID(),
              providerName: providerName,
              status: E360App_shop_purchaseStatus.PENDING,
            },
            {
              createdAt: purchaseDate,
              data: JSON.stringify({
                petType,
                petName,
                motherBreed,
                fatherBreed,
                fatherBreedGUID,
                mixedBreed,
                motherBreedGUID,
                dateOfBirth,
                microchip,
                role,
                gender,
              }),
              event: 'PET_DATA',
              guid: createGUID(),
              providerName: 'PETPASS CARREFOUR CHATBOT',
              status: E360App_shop_purchaseStatus.PENDING,
            },
            {
              createdAt: purchaseDate,
              data: JSON.stringify({
                confirmRealData,
              }),
              event: 'CONFIRM_REAL_DATA',
              guid: createGUID(),
              providerName: 'PETPASS CARREFOUR CHATBOT',
              status: E360App_shop_purchaseStatus.PENDING,
            },
          ],

          //---end BasicData
          //contractData
          customerAddressType: roadType,
          customerAddress: address,
          customerAddressNumber: addressNumber,
          customerAddressInfo: addressInfo,
          customerCity: city,
          customerZipCode: postalCode,
          customerDocumentId: dni,
          customerBirthDate: birthDate,
          customerDataRaw: customerDataRaw,
          customerCompany: companyName,
          customerCompanyDocumentId: companyDocumentId,
          status: E360App_shop_purchaseStatus.PAID,
          discount,
          discountType,
          discountValue,
          taxPercentage: appProductTaxValue,
          taxValue: Math.round(costTaxValue),
          taxType: appProductTaxType,
          taxValueType: appProductTaxValueType,
          total: Math.round(total),
          operations: [],
          promotionCode: promo ? { guid: promo?.guid } : null,
          petpassPurchase: {
            guid: createGUID(),
            app: { guid: petpassApp.petPassAppGUID },
            partner: petpassPartner ? { guid: petpassPartner?.guid } : null,
            products: [{ id: productGUID }],
            petInsurances: [],
          },
          channel: E360App_shop_channel.PARTNER,
          // metaadataIP: metadata.ip,
          // metadataOrigin: origin,
          // metadataAccuracyType: metadata.location ? metadata.location.accuracyType : null,
          // metadataLat: metadata.location ? metadata.location.lat : null,
          // metadataLon: metadata.location ? metadata.location.lon : null,
          // metadataCity: metadata.location ? metadata.city : null,
          // metadataRegion: metadata.location ? metadata.region : null,
          // metadataCountry: metadata.location ? metadata.country : null,
          // metadataPlatform: ExternalAPI_platformType.WEB,
          // metadataTimezone: metadata.timezone,

          // ux: ux,
        },
      ],
    },
    token: '',
  })

  const purchase = result.data?.addE360App_shop_purchase?.e360App_shop_purchase?.[0]

  return { isSuccess: true, isValid: true, purchase, customerDataRaw }
}
