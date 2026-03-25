export const PROPERTY_TYPES = [
  'Apartment',
  'Bungalow',
  'Duplex',
  'Mansion',
  'Land',
  'Office',
  'Shop',
  'Warehouse',
]

/** Full server-side property type keys (used in AddProperty form). */
export const PROPERTY_TYPE_OPTIONS = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'Block of Flat', value: 'blockOfFlat' },
  { label: 'Studio', value: 'studio' },
  { label: 'Villa', value: 'villa' },
  { label: 'Bungalow', value: 'bungalow' },
  { label: 'Land', value: 'land' },
  { label: 'Penthouse', value: 'penthouse' },
  { label: 'Duplex', value: 'duplex' },
  { label: 'Semi-detached House', value: 'SemiDetachedHouse' },
  { label: 'Terraced House', value: 'terracedHouse' },
  { label: 'Detached House', value: 'detachedHouse' },
  { label: 'Mansion', value: 'mansion' },
  { label: 'Maisonette', value: 'maisonette' },
  { label: 'Traditional House', value: 'traditionalHouse' },
  { label: 'Commercial Building', value: 'commercialBuilding' },
  { label: 'Industrial Property', value: 'industrialProperty' },
  { label: 'Mixed-use Building', value: 'mixedUseBuilding' },
  { label: 'Recreational Land', value: 'recreationalLand' },
  { label: 'Agricultural Land', value: 'agriculturalLand' },
  { label: 'Office Space', value: 'officeSpace' },
  { label: 'Retail Space', value: 'retailSpace' },
  { label: 'Warehouse', value: 'warehouse' },
]

export const PURPOSES = ['Rent', 'Sell']

export const ROLES = {
  TENANT: 'tenant',
  LANDLORD: 'landlord',
  ADMIN: 'admin',
}

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
}
