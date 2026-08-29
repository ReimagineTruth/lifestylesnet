let loadPromise: Promise<void> | null = null;

export function googleMapsApiKey() {
  return import.meta.env["VITE_GOOGLE_MAPS_API_KEY"] as string | undefined;
}

export function loadGoogleMapsPlaces(): Promise<void> {
  const key = googleMapsApiKey();
  if (!key) return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not configured"));
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps runs in browser only"));

  const w = window as Window & { google?: { maps?: { places?: unknown } } };
  if (w.google?.maps?.places) return Promise.resolve();

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = "__lifestylesGoogleMapsInit";
    (window as unknown as Record<string, () => void>)[callbackName] = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => reject(new Error("Could not load Google Maps"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export type ParsedPhilippineAddress = {
  address: string;
  city: string;
  province: string;
  postal: string;
};

export function parseGooglePlace(place: google.maps.places.PlaceResult): ParsedPhilippineAddress {
  const components = place.address_components ?? [];
  const pick = (type: string, useShort = false) => {
    const c = components.find((x) => x.types.includes(type));
    return (useShort ? c?.short_name : c?.long_name) ?? "";
  };

  const streetNumber = pick("street_number");
  const route = pick("route");
  const sublocality =
    pick("sublocality_level_1") || pick("sublocality") || pick("neighborhood");
  const city =
    pick("locality") || pick("administrative_area_level_2") || pick("administrative_area_level_3");
  const province = pick("administrative_area_level_1", true) || pick("administrative_area_level_1");
  const postal = pick("postal_code");

  const street = [streetNumber, route].filter(Boolean).join(" ").trim();
  const address = street || sublocality || place.formatted_address?.split(",")[0]?.trim() || "";

  return {
    address,
    city: city || sublocality,
    province,
    postal,
  };
}
