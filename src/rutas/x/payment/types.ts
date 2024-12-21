export interface Payload {
  purchaseGUID: string
  purchaseDate: string
  productGUID: string
  promoCode?: string
  partnerGUID?: string
  providerName: string
  ux?: string
  fx?: string

  //basicdata
  name: string
  lastName: string
  secondLastName?: string
  email: string
  phone: string
  acceptPrivacyPolicy: boolean
  //contractData
  dni: string
  birthDate: string

  roadType?: string
  address: string
  addressNumber: string
  addressInfo?: string
  postalCode: string
  city: string
  province: string
  // Se fuerza el país
  country: string
  // providerName: string
  companyName?: string
  companyDocumentId?: string
  //petData
  petType: string
  petName: string
  petBreed?: string
  motherBreed?: string
  fatherBreed?: string
  motherBreedGUID?: string
  fatherBreedGUID?: string
  mixedBreed?: boolean
  dateOfBirth?: string
  role?: string
  gender?: string
  microchip?: string
  //acceptance
  confirmRealData: boolean
  //
  // customerDataRaw: string
}
/*
export enum E360App_shop_promotionType {
  CASHBACK = 'CASHBACK',
  DISCOUNT = 'DISCOUNT',
}

export enum E360App_shop_purchaseDiscountType {
  NONE = 'NONE',
  PERCENTAGE = 'PERCENTAGE',
  SPECIAL_PRICE = 'SPECIAL_PRICE',
  VALUE = 'VALUE',
}
export enum PETPASS_productType {
  INSURANCE = 'INSURANCE',
  SOFTWARE = 'SOFTWARE',
}
export enum E360App_shop_productStatus {
  AVAILABLE = 'AVAILABLE',
  COMING_SOON = 'COMING_SOON',
  UNAVAILABLE = 'UNAVAILABLE',
}
export enum E360App_shop_productStockType {
  IN_STOCK = 'IN_STOCK',
  ON_DEMAND = 'ON_DEMAND',
}
export enum E360App_shop_taxType { //que????
  CASHBACK = 'CASHBACK',
  DISCOUNT = 'DISCOUNT',
  SPECIAL = 'SPECIAL',
  STANDARD = 'STANDARD',
}
export enum e360App_shop_taxType {
  EXCLUDED = 'EXCLUDED',
  INCLUDED = 'INCLUDED',
}
export enum e360App_shop_taxValueType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}
export enum E360App_shop_channel {
  OFFICIAL_ANDROID = 'OFFICIAL_ANDROID',
  OFFICIAL_IOS = 'OFFICIAL_IOS',
  OFFICIAL_WEB = 'OFFICIAL_WEB',
  PARTNER = 'PARTNER',
  TEST = 'TEST',
  UNKNOWN = 'UNKNOWN',
}
export enum E360App_shop_operationType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
}
export enum E360App_userStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  INACTIVE = 'INACTIVE',
}

export enum E360App_shop_purchaseStatus {
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
  PAID = 'PAID',
  PENDING = 'PENDING',
  REFUNDED = 'REFUNDED',
}
export enum E360App_shop_paymentMethod {
  PAYPAL = 'PAYPAL',
  REDSYS = 'REDSYS',
  STRIPE = 'STRIPE',
  TRANSFER = 'TRANSFER',
}
*/
