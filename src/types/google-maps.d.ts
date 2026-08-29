declare namespace google.maps.places {
  interface PlaceResult {
    address_components?: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
    formatted_address?: string;
    geometry?: { location?: { lat(): number; lng(): number } };
  }

  class Autocomplete {
    constructor(input: HTMLInputElement, opts?: { componentRestrictions?: { country: string }; fields?: string[] });
    addListener(event: string, handler: () => void): void;
    getPlace(): PlaceResult;
  }
}

declare namespace google.maps {
  class Map {
    constructor(el: HTMLElement, opts?: { center?: { lat: number; lng: number }; zoom?: number });
    setCenter(center: { lat: number; lng: number }): void;
  }
  class Marker {
    constructor(opts?: { map?: Map; position?: { lat: number; lng: number } });
    setPosition(position: { lat: number; lng: number }): void;
    setMap(map: Map | null): void;
  }
}

declare const google: {
  maps: {
    places: typeof google.maps.places;
    Map: typeof google.maps.Map;
    Marker: typeof google.maps.Marker;
  };
};
