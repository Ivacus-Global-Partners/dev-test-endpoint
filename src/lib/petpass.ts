export enum PetRole {
  ASSISTANCE = 'ASSISTANCE',
  BREEDING = 'BREEDING',
  COMPANION = 'COMPANION',
  FARMER = 'FARMER',
  HOME_WATCHDOG = 'HOME_WATCHDOG',
  HUNTER = 'HUNTER',
  OUTDOOR_WATCHDOG = 'OUTDOOR_WATCHDOG',
}
export enum PetGender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
}

export function parsePetRole(r: string): PetRole {
  switch (r) {
    case 'COMPANION':
      return PetRole.COMPANION
    case 'ASSISTANCE':
      return PetRole.ASSISTANCE
    case 'HOME_WATCHDOG':
      return PetRole.HOME_WATCHDOG
    case 'OUTDOOR_WATCHDOG':
      return PetRole.OUTDOOR_WATCHDOG
    case 'FARMER':
      return PetRole.FARMER
    case 'HUNTER':
      return PetRole.HUNTER
    case 'BREEDING':
      return PetRole.BREEDING
    default:
      return PetRole.COMPANION
  }
}
