import { HonoRequest } from 'hono'
import * as geoip from 'geoip-lite'

export interface ExternalAPI_metadata_location {
  lat: number
  lon: number
  accuracyType: ExternalAPI_metadata_location_accuracyType
}

export enum ExternalAPI_metadata_location_accuracyType {
  UNDEFINED = 'UNDEFINED',
  BLOCKED = 'BLOCKED',
  PROVIDED_BY_IP = 'PROVIDED_BY_IP',
  PROVIDED_BY_USER = 'PROVIDED_BY_USER',
}

export enum ExternalAPI_platformType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB',
  WEBAPP = 'WEBAPP',
  UNKNOWN = 'UNKNOWN',
}

export interface ExternalAPI_metadata {
  location: ExternalAPI_metadata_location
  ip: string
  origin: string
  userAgent: string
  referer: string
  host: string
  platform: ExternalAPI_platformType
  city: string
  region: string
  country: string
  timezone: string
}

export default interface ExternalAPIRequest extends HonoRequest {
  petpassApp: {
    guid: string
  }
  e360App: {
    guid: string
  }
  e360AppShop: {
    guid: string
  }
  allowedDomains: string[]
  allowedOrigins: string[]
  isProduction: boolean
  isDomainAllowed: boolean
  isOriginAllowed: boolean
  metadata: ExternalAPI_metadata
  providerMap: Map<string, ExternalAPI_provider>
}

export interface ExternalAPI_provider {
  key: string
  name: string
  allowedOrigins: string[]
}

function catchRequestMetadata(req: ExternalAPIRequest) {
  const defaultMetadata: ExternalAPI_metadata = {
    location: {
      lat: 0,
      lon: 0,
      accuracyType: ExternalAPI_metadata_location_accuracyType.UNDEFINED,
    },
    ip: '',
    origin: '',
    userAgent: '',
    referer: '',
    host: '',
    platform: parseMetadataPlatform(req.header('x-app-platform') as string),
    city: '',
    region: '',
    country: '',
    timezone: '',
  }

  try {
    const ip = req.header('x-forwarded-for')
    const platform = defaultMetadata.platform
    const userAgent = req.header('User-Agent')
    const referer = req.header('Referer')
    const origin = req.header('Origin')
    const host = req.header('Host')
    const location = geoip.lookup(ip as string)

    console.log(`IP: ${ip} `)
    console.log(`User Agent: ${userAgent} `)
    console.log(`Referer: ${referer} `)
    console.log(`Origin: ${origin} `)
    console.log(`Host: ${host} `)
    console.log(`Location: ${JSON.stringify(location, null, 2)} `)

    const locationMetadata =
      location && location.ll
        ? {
            location: {
              lat: location.ll[0],
              lon: location.ll[1],
              accuracyType: ExternalAPI_metadata_location_accuracyType.PROVIDED_BY_IP,
            },
          }
        : {
            location: defaultMetadata.location,
          }

    const city = location && location.city
    const region = location && location.region
    const country = location && location.country
    const timezone = location && location.timezone

    return {
      ...locationMetadata,
      ip: ip as string,
      origin: origin as string,
      userAgent: userAgent as string,
      referer: referer as string,
      host: host as string,
      platform: platform,
      city: city,
      region: region,
      country: country,
      timezone: timezone,
    }
  } catch (error) {
    console.error(error)
    return defaultMetadata
  }
}

function parseMetadataPlatform(platform: string): ExternalAPI_platformType {
  switch (platform) {
    case 'ios':
      return ExternalAPI_platformType.IOS
    case 'android':
      return ExternalAPI_platformType.ANDROID
    case 'web':
      return ExternalAPI_platformType.WEB
    default:
      return ExternalAPI_platformType.UNKNOWN
  }
}
