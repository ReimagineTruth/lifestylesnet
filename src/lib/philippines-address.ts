import {
  getBarangayByCode,
  getBarangaysByMunicipality,
  getMunicipalitiesByProvince,
  getMunicipalityByCode,
  getPostalCodesByMunicipality,
  getProvinceByCode,
  getProvincesByRegion,
  getRegionByCode,
  getAllRegions,
  type PHBarangay,
  type PHMunicipality,
  type PHProvince,
  type PHRegion,
} from "@aivangogh/ph-address";

export type { PHBarangay, PHMunicipality, PHProvince, PHRegion };

export function listRegions() {
  return getAllRegions();
}

export function listProvinces(regionCode: string) {
  return regionCode ? getProvincesByRegion(regionCode) : [];
}

export function listMunicipalities(provinceCode: string) {
  return provinceCode ? getMunicipalitiesByProvince(provinceCode) : [];
}

export function listBarangays(municipalityCode: string) {
  return municipalityCode ? getBarangaysByMunicipality(municipalityCode) : [];
}

export function lookupRegion(code: string) {
  return code ? getRegionByCode(code) : undefined;
}

export function lookupProvince(code: string) {
  return code ? getProvinceByCode(code) : undefined;
}

export function lookupMunicipality(code: string) {
  return code ? getMunicipalityByCode(code) : undefined;
}

export function lookupBarangay(code: string) {
  return code ? getBarangayByCode(code) : undefined;
}

/** PSA names are often ALL CAPS — normalize for display and orders. */
export function formatPhPlace(name: string) {
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function defaultPostalForMunicipality(municipalityCode: string) {
  const codes = getPostalCodesByMunicipality(municipalityCode);
  if (codes.length === 1) return codes[0]!.postalCode;
  return "";
}

export function composeDeliveryAddress(barangayName: string, street: string) {
  const parts = [barangayName ? formatPhPlace(barangayName) : "", street.trim()].filter(Boolean);
  return parts.join(", ");
}
