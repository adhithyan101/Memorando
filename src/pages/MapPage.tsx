import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, MapPin, Sparkles } from 'lucide-react';
// GOOGLE MAPS API (TEMPORARILY HELD ON - UNCOMMENT WHEN READY)
// import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useAuth } from '../contexts/AuthContext';
import { getMemories } from '../services/firestore';
import { Memory } from '../types';

/*
const mapContainerStyle = {
  width: '100%',
  height: '550px',
  borderRadius: '1.5rem',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};
*/

export const MapPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [memoriesWithLocation, setMemoriesWithLocation] = useState<Memory[]>([]);
  // const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  // GOOGLE MAPS API KEY (ON HOLD)
  // const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  // const { isLoaded } = useJsApiLoader({
  //   id: 'google-map-script',
  //   googleMapsApiKey: googleMapsApiKey,
  // });

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      getMemories(currentUser.uid)
        .then((all) => {
          // Filter memories containing location
          const valid = all.filter(m => m.location?.name);
          setMemoriesWithLocation(valid);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <div className="flex items-center space-x-2 text-terracotta">
          <MapIcon className="w-6 h-6" />
          <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">Memory Places</h1>
        </div>
        <p className="text-sm text-slate dark:text-slate-dark mt-1">
          Explore where your life stories happened around the world.
        </p>
      </div>

      {/* AUTHENTIC EMPTY STATE */}
      {!loading && memoriesWithLocation.length === 0 && (
        <div className="p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-dashed border-sand dark:border-sand-dark text-center space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-charcoal-dark">
            Your memories will appear here when you add a place.
          </h2>
          <p className="text-sm text-slate dark:text-slate-dark leading-relaxed">
            Attach a city or location to your memories to visualize your journey.
          </p>
        </div>
      )}

      {/* LOCATION CARDS VIEW */}
      {memoriesWithLocation.length > 0 && (
        <div className="space-y-6">
          {/* 
            GOOGLE MAP COMPONENT (COMMENTED OUT ON HOLD)
            Uncomment when VITE_GOOGLE_MAPS_API_KEY is configured.
          */}
          {/*
          {isLoaded && googleMapsApiKey ? (
            <div className="rounded-3xl overflow-hidden shadow-warm border border-sand dark:border-sand-dark">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={
                  memoriesWithLocation[0]?.location?.latitude && memoriesWithLocation[0]?.location?.longitude
                    ? { lat: memoriesWithLocation[0].location.latitude, lng: memoriesWithLocation[0].location.longitude }
                    : defaultCenter
                }
                zoom={4}
              >
                {memoriesWithLocation.map((m) => (
                  m.location?.latitude && m.location?.longitude ? (
                    <MarkerF
                      key={m.id}
                      position={{ lat: m.location.latitude, lng: m.location.longitude }}
                      onClick={() => setSelectedMemory(m)}
                    />
                  ) : null
                ))}
              </GoogleMap>
            </div>
          ) : null}
          */}

          {/* ELEGANT MEMORY LOCATION CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {memoriesWithLocation.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/memory/${m.id}`)}
                className="p-5 bg-card-light dark:bg-card-dark rounded-3xl border border-sand dark:border-sand-dark cursor-pointer hover:shadow-warm transition space-y-2"
              >
                <div className="flex items-center space-x-2 text-terracotta text-xs font-semibold">
                  <MapPin className="w-4 h-4" />
                  <span>{m.location?.name}</span>
                </div>
                <h3 className="font-serif font-bold text-base text-charcoal dark:text-charcoal-dark">{m.title || 'Untitled Memory'}</h3>
                <p className="text-xs text-slate dark:text-slate-dark">{m.memoryDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
