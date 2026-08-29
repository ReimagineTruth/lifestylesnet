import { MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  googleMapsApiKey,
  loadGoogleMapsPlaces,
  parseGooglePlace,
  type ParsedPhilippineAddress,
} from "@/lib/googleMaps";

const field =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

type Props = {
  values: ParsedPhilippineAddress & { name: string; email: string; phone: string; notes: string };
  errors: Record<string, string>;
  onChange: (patch: Partial<ParsedPhilippineAddress & { name: string; email: string; phone: string; notes: string }>) => void;
};

export function DeliveryAddressForm({ values, errors, onChange }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  const hasKey = Boolean(googleMapsApiKey());

  useEffect(() => {
    if (!hasKey) return;
    void loadGoogleMapsPlaces()
      .then(() => setMapsReady(true))
      .catch((err: Error) => setMapsError(err.message));
  }, [hasKey]);

  useEffect(() => {
    if (!mapsReady || !searchRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(searchRef.current, {
      componentRestrictions: { country: "ph" },
      fields: ["address_components", "formatted_address", "geometry"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const parsed = parseGooglePlace(place);
      onChange({
        address: parsed.address || place.formatted_address?.split(",")[0] || "",
        city: parsed.city,
        province: parsed.province,
        postal: parsed.postal,
      });

      const loc = place.geometry?.location;
      if (loc && mapRef.current) {
        const pos = { lat: loc.lat(), lng: loc.lng() };
        if (!mapInstance.current) {
          mapInstance.current = new google.maps.Map(mapRef.current, { center: pos, zoom: 16 });
          markerInstance.current = new google.maps.Marker({ map: mapInstance.current, position: pos });
        } else {
          mapInstance.current.setCenter(pos);
          markerInstance.current?.setPosition(pos);
        }
      }
    });
  }, [mapsReady, onChange]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors["name"]}>
          <input
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={field}
            autoComplete="name"
          />
        </Field>
        <Field label="Email" error={errors["email"]}>
          <input
            type="email"
            value={values.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={field}
            autoComplete="email"
          />
        </Field>
        <Field label="Mobile number" error={errors["phone"]}>
          <input
            value={values.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className={field}
            autoComplete="tel"
            placeholder="09XX XXX XXXX"
          />
        </Field>
        <Field label="Postal code" error={errors["postal"]}>
          <input
            value={values.postal}
            onChange={(e) => onChange({ postal: e.target.value })}
            className={field}
            autoComplete="postal-code"
          />
        </Field>
      </div>

      <div>
        <label className="text-sm font-medium">
          Search address (Google Maps)
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              placeholder={
                hasKey
                  ? "Type barangay, street, or landmark…"
                  : "Add VITE_GOOGLE_MAPS_API_KEY for map search"
              }
              disabled={!hasKey || !mapsReady}
              className={`${field} pl-9`}
            />
          </div>
        </label>
        {!hasKey && (
          <p className="mt-2 text-xs text-muted-foreground">
            Map search is off — fill in the address fields manually below.
          </p>
        )}
        {mapsError && <p className="mt-2 text-xs text-destructive">{mapsError}</p>}
        {hasKey && (
          <div
            ref={mapRef}
            className="mt-3 h-44 w-full overflow-hidden rounded-lg border border-border bg-muted/30"
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Street / house / building" error={errors["address"]}>
            <input
              value={values.address}
              onChange={(e) => onChange({ address: e.target.value })}
              className={field}
              autoComplete="street-address"
            />
          </Field>
        </div>
        <Field label="City / Municipality" error={errors["city"]}>
          <input
            value={values.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className={field}
            autoComplete="address-level2"
          />
        </Field>
        <Field label="Province" error={errors["province"]}>
          <input
            value={values.province}
            onChange={(e) => onChange({ province: e.target.value })}
            className={field}
            autoComplete="address-level1"
          />
        </Field>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">
            Delivery notes (optional)
            <textarea
              rows={3}
              value={values.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              className={field}
              placeholder="Landmark, gate code, delivery instructions…"
            />
          </label>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
        Pick your location on the map like Shopee — search first, then confirm street and city.
      </p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-normal text-destructive">{error}</span>}
    </label>
  );
}
