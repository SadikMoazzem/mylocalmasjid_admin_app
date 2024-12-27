import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { TextInput, Paper, Box } from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';

// Replace with your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface Location {
  latitude: number;
  longitude: number;
  full_address: string;
  city: string;
  country: string;
}

interface Suggestion {
  text: string;
  place_name: string;
  center: [number, number];
  context: any[];
}

interface MapboxSearchProps {
  initialLocation?: Location;
  onLocationSelect: (location: Location) => void;
}

export function MapboxSearch({ initialLocation, onLocationSelect }: MapboxSearchProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useDebouncedState('', 500);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setDebouncedQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialLocation ? 
        [initialLocation.longitude, initialLocation.latitude] : 
        [-1.890401, 52.486244], // Center of UK
      zoom: initialLocation ? 15 : 5
    });

    if (initialLocation) {
      marker.current = new mapboxgl.Marker()
        .setLngLat([initialLocation.longitude, initialLocation.latitude])
        .addTo(map.current);
    }

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      updateMarkerPosition(lng, lat);
      fetchLocationDetails(lat, lng);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  const updateMarkerPosition = (lng: number, lat: number) => {
    if (!map.current) return;

    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current);
    }
    
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15
    });
  };

  const fetchLocationDetails = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const city = feature.context?.find((c: any) => c.id.includes('place'))?.text || '';
        const country = feature.context?.find((c: any) => c.id.includes('country'))?.text || '';
        
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          full_address: feature.place_name,
          city,
          country,
        });
        setSearchQuery(feature.place_name);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const [lng, lat] = suggestion.center;
    updateMarkerPosition(lng, lat);
    const city = suggestion.context?.find((c: any) => c.id.includes('place'))?.text || '';
    const country = suggestion.context?.find((c: any) => c.id.includes('country'))?.text || '';
    
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      full_address: suggestion.place_name,
      city,
      country,
    });
    setSearchQuery(suggestion.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      return;
    }

    const searchLocation = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedQuery)}.json?access_token=${mapboxgl.accessToken}&country=gb&types=place,address,poi`
        );
        const data = await response.json();

        if (data.features) {
          setSuggestions(data.features);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error searching location:', error);
      }
    };

    searchLocation();
  }, [debouncedQuery]);

  return (
    <Paper shadow="xs" p="md">
      <div style={{ position: 'relative' }}>
        <TextInput
          label="Search location"
          placeholder="Enter an address or place name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          mb="md"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
                className="hover:bg-gray-100"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                {suggestion.place_name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />
    </Paper>
  );
} 