import { MapPin } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import {
  composeDeliveryAddress,
  defaultPostalForMunicipality,
  formatPhPlace,
  listBarangays,
  listMunicipalities,
  listProvinces,
  listRegions,
  lookupBarangay,
  lookupMunicipality,
  lookupProvince,
} from "@/lib/philippines-address";

const field =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

type AddressValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal: string;
  notes: string;
};

type Props = {
  values: AddressValues;
  errors: Record<string, string>;
  onChange: (patch: Partial<AddressValues>) => void;
};

export function DeliveryAddressForm({ values, errors, onChange }: Props) {
  const regions = useMemo(() => listRegions(), []);

  const [regionCode, setRegionCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [municipalityCode, setMunicipalityCode] = useState("");
  const [barangayCode, setBarangayCode] = useState("");
  const [street, setStreet] = useState(values.address);

  const provinces = useMemo(() => listProvinces(regionCode), [regionCode]);
  const municipalities = useMemo(() => listMunicipalities(provinceCode), [provinceCode]);
  const barangays = useMemo(() => listBarangays(municipalityCode), [municipalityCode]);

  function pushLocation(
    next: {
      regionCode?: string;
      provinceCode?: string;
      municipalityCode?: string;
      barangayCode?: string;
      street?: string;
    },
    postalOverride?: string,
  ) {
    const pCode = next.provinceCode ?? provinceCode;
    const mCode = next.municipalityCode ?? municipalityCode;
    const bCode = next.barangayCode ?? barangayCode;
    const streetLine = next.street ?? street;

    const province = lookupProvince(pCode);
    const municipality = lookupMunicipality(mCode);
    const barangay = lookupBarangay(bCode);

    const patch: Partial<AddressValues> = {
      province: province ? formatPhPlace(province.name) : "",
      city: municipality ? formatPhPlace(municipality.name) : "",
      address: composeDeliveryAddress(barangay?.name ?? "", streetLine),
    };

    if (postalOverride !== undefined) {
      patch.postal = postalOverride;
    } else if (mCode && !values.postal) {
      const suggested = defaultPostalForMunicipality(mCode);
      if (suggested) patch.postal = suggested;
    }

    onChange(patch);
  }

  function onRegionChange(code: string) {
    setRegionCode(code);
    setProvinceCode("");
    setMunicipalityCode("");
    setBarangayCode("");
    onChange({ province: "", city: "", address: street.trim() });
  }

  function onProvinceChange(code: string) {
    setProvinceCode(code);
    setMunicipalityCode("");
    setBarangayCode("");
    pushLocation({ provinceCode: code, municipalityCode: "", barangayCode: "" });
  }

  function onMunicipalityChange(code: string) {
    setMunicipalityCode(code);
    setBarangayCode("");
    const postal = defaultPostalForMunicipality(code);
    pushLocation({ municipalityCode: code, barangayCode: "" }, postal || values.postal);
  }

  function onBarangayChange(code: string) {
    setBarangayCode(code);
    pushLocation({ barangayCode: code });
  }

  function onStreetChange(line: string) {
    setStreet(line);
    pushLocation({ street: line });
  }

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
            placeholder="4-digit ZIP"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Region" error={errors["region"]}>
          <select
            value={regionCode}
            onChange={(e) => onRegionChange(e.target.value)}
            className={field}
          >
            <option value="">Select region</option>
            {regions.map((r) => (
              <option key={r.psgcCode} value={r.psgcCode}>
                {formatPhPlace(r.designation || r.name)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Province" error={errors["province"]}>
          <select
            value={provinceCode}
            onChange={(e) => onProvinceChange(e.target.value)}
            disabled={!regionCode}
            className={field}
          >
            <option value="">Select province</option>
            {provinces.map((p) => (
              <option key={p.psgcCode} value={p.psgcCode}>
                {formatPhPlace(p.name)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City / Municipality" error={errors["city"]}>
          <select
            value={municipalityCode}
            onChange={(e) => onMunicipalityChange(e.target.value)}
            disabled={!provinceCode}
            className={field}
          >
            <option value="">Select city or municipality</option>
            {municipalities.map((m) => (
              <option key={m.psgcCode} value={m.psgcCode}>
                {formatPhPlace(m.name)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Barangay" error={errors["barangay"]}>
          <select
            value={barangayCode}
            onChange={(e) => onBarangayChange(e.target.value)}
            disabled={!municipalityCode}
            className={field}
          >
            <option value="">Select barangay</option>
            {barangays.map((b) => (
              <option key={b.psgcCode} value={b.psgcCode}>
                {formatPhPlace(b.name)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Street / house / building" error={errors["address"]}>
        <input
          value={street}
          onChange={(e) => onStreetChange(e.target.value)}
          className={field}
          autoComplete="street-address"
          placeholder="Unit, street, subdivision, landmark…"
        />
      </Field>

      <label className="block text-sm font-medium">
        Delivery notes (optional)
        <textarea
          rows={3}
          value={values.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          className={field}
          placeholder="Gate code, delivery instructions…"
        />
      </label>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
        Select your location from the official Philippine address list — no map or API key
        needed.
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
