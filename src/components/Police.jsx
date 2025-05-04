// import React, { useState, useEffect } from 'react';
// import '../styling/PoliceStationLocator.css'; // Import your CSS file for styling
//  // Create this CSS file for styling

// const PoliceStationLocator = () => {
//   const [userLocation, setUserLocation] = useState(null);
//   const [stations, setStations] = useState([]);
//   const [selectedStation, setSelectedStation] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Mock data - in a real app, you would fetch this from an API
//   const mockStations = [
//     {
//       id: 1,
//       name: "Central Police Station",
//       address: "123 Main Street, City Center",
//       phone: "+1 (555) 123-4567",
//       coordinates: { lat: 40.7128, lng: -74.0060 },
//       distance: 1.2
//     },
//     {
//       id: 2,
//       name: "North District Police Station",
//       address: "456 North Avenue, North District",
//       phone: "+1 (555) 234-5678",
//       coordinates: { lat: 40.7228, lng: -74.0160 },
//       distance: 2.5
//     },
//     {
//       id: 3,
//       name: "South Precinct Police Station",
//       address: "789 South Boulevard, Southside",
//       phone: "+1 (555) 345-6789",
//       coordinates: { lat: 40.7028, lng: -73.9960 },
//       distance: 1.8
//     }
//   ];

//   // Get user's current location
//   const getUserLocation = () => {
//     setLoading(true);
//     setError(null);
    
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           });
//           // In a real app, you would fetch nearby stations from an API
//           // Here we're using mock data
//           setStations(mockStations);
//           setLoading(false);
//         },
//         (err) => {
//           setError("Unable to retrieve your location. Please enable location services.");
//           setLoading(false);
//           // Fallback to default location if user denies location
//           setUserLocation({ lat: 40.7128, lng: -74.0060 });
//           setStations(mockStations);
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by your browser.");
//       setLoading(false);
//       // Fallback to default location
//       setUserLocation({ lat: 40.7128, lng: -74.0060 });
//       setStations(mockStations);
//     }
//   };

//   useEffect(() => {
//     getUserLocation();
//   }, []);

//   const handleStationSelect = (station) => {
//     setSelectedStation(station);
//   };

//   const getDirections = (station) => {
//     if (!userLocation) return;
    
//     // In a real app, this would open Google Maps or another mapping service
//     alert(`Directions from your location to ${station.name} would be displayed here.\n\nIn a real implementation, this would open Google Maps with directions.`);
//   };

//   return (
//     <div className="police-station-locator">
//       <header>
//         <h1>Police Station Locator</h1>
//         <p>Find the nearest police stations and get directions instantly</p>
//       </header>

//       <div className="locator-container">
//         {loading && <div className="loading">Loading your location...</div>}
//         {error && <div className="error">{error}</div>}

//         <div className="station-list">
//           <h2>Nearby Police Stations</h2>
//           <ul>
//             {stations.map(station => (
//               <li 
//                 key={station.id} 
//                 className={selectedStation?.id === station.id ? 'selected' : ''}
//                 onClick={() => handleStationSelect(station)}
//               >
//                 <h3>{station.name}</h3>
//                 <p>{station.address}</p>
//                 <p>{station.distance} miles away</p>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="station-details">
//           {selectedStation ? (
//             <>
//               <h2>{selectedStation.name}</h2>
//               <p><strong>Address:</strong> {selectedStation.address}</p>
//               <p><strong>Phone:</strong> {selectedStation.phone}</p>
//               <p><strong>Distance:</strong> {selectedStation.distance} miles</p>
              
//               <div className="action-buttons">
//                 <button onClick={() => getDirections(selectedStation)}>
//                   Get Directions
//                 </button>
//                 <button onClick={() => window.location.href = `tel:${selectedStation.phone.replace(/\D/g, '')}`}>
//                   Call Station
//                 </button>
//               </div>

//               {/* In a real app, you would embed a map here */}
//               <div className="map-placeholder">
//                 [Map would be displayed here showing your location and the selected police station]
//               </div>
//             </>
//           ) : (
//             <div className="no-selection">
//               <p>Select a police station to view details and get directions</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PoliceStationLocator;



// import React, { useState, useEffect, useRef } from 'react';
// import mapboxgl from 'mapbox-gl';
// import '../styling/PoliceStationLocator.css';
// // Initialize Mapbox
// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// const PoliceStationLocator = () => {
//   const [userLocation, setUserLocation] = useState(null);
//   const [stations, setStations] = useState([]);
//   const [selectedStation, setSelectedStation] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const [zoom] = useState(12);

//   // Get user's current location and nearby police stations
//   const getUserLocation = () => {
//     setLoading(true);
//     setError(null);
    
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const location = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           };
//           setUserLocation(location);
//           initializeMap(location);
//           try {
//             await fetchNearbyPoliceStations(location);
//           } catch (err) {
//             setError("Failed to fetch police stations");
//           }
//           setLoading(false);
//         },
//         (err) => {
//           setError("Unable to retrieve your location. Please enable location services.");
//           setLoading(false);
//           // Fallback to default location (New York)
//           const defaultLocation = { lat: 40.7128, lng: -74.0060 };
//           setUserLocation(defaultLocation);
//           initializeMap(defaultLocation);
//           fetchNearbyPoliceStations(defaultLocation);
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by your browser.");
//       setLoading(false);
//       // Fallback to default location (New York)
//       const defaultLocation = { lat: 40.7128, lng: -74.0060 };
//       setUserLocation(defaultLocation);
//       initializeMap(defaultLocation);
//       fetchNearbyPoliceStations(defaultLocation);
//     }
//   };

//   // Initialize Mapbox map
//   const initializeMap = (center) => {
//     if (map.current) return; // initialize map only once
    
//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: 'mapbox://styles/mapbox/streets-v11',
//       center: [center.lng, center.lat],
//       zoom: zoom
//     });

//     // Add user location marker
//     new mapboxgl.Marker({ color: '#4285F4' })
//       .setLngLat([center.lng, center.lat])
//       .setPopup(new mapboxgl.Popup().setHTML("<h3>Your Location</h3>"))
//       .addTo(map.current);
//   };

//   // Fetch nearby police stations using Mapbox Geocoding API
//   const fetchNearbyPoliceStations = async (location) => {
//     try {
//       const response = await fetch(
//         `https://api.mapbox.com/geocoding/v5/mapbox.places/police.json?` +
//         `proximity=${location.lng},${location.lat}` +
//         `&access_token=${mapboxgl.accessToken}`
//       );
      
//       const data = await response.json();
      
//       if (data.features && data.features.length > 0) {
//         const stationsWithDetails = data.features.map((place, index) => ({
//           id: place.id || `station-${index}`,
//           name: place.text || 'Police Station',
//           address: place.place_name,
//           coordinates: place.center,
//           distance: calculateDistance(
//             location.lat, 
//             location.lng,
//             place.center[1],
//             place.center[0]
//           )
//         }));
//         setStations(stationsWithDetails);
        
//         // Add markers to map
//         stationsWithDetails.forEach(station => {
//           new mapboxgl.Marker({ color: '#FF5252' })
//             .setLngLat(station.coordinates)
//             .setPopup(new mapboxgl.Popup().setHTML(`
//               <h3>${station.name}</h3>
//               <p>${station.address}</p>
//               <p>${station.distance} miles away</p>
//             `))
//             .addTo(map.current);
//         });
//       } else {
//         setStations([]);
//       }
//     } catch (err) {
//       console.error("Error fetching police stations:", err);
//       setError("Failed to fetch police station data");
//     }
//   };

//   // Calculate distance between two points in miles
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371; // Earth radius in km
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = 
//       Math.sin(dLat/2) * Math.sin(dLat/2) +
//       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
//       Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     const distanceKm = R * c;
//     return (distanceKm * 0.621371).toFixed(1); // Convert to miles
//   };

//   const handleStationSelect = (station) => {
//     setSelectedStation(station);
//     // Center map on selected station
//     if (map.current) {
//       map.current.flyTo({
//         center: station.coordinates,
//         zoom: 15
//       });
//     }
//   };

//   const getDirections = () => {
//     if (!selectedStation || !userLocation) return;
    
//     const url = `https://www.mapbox.com/directions/?` +
//       `origin=${userLocation.lng},${userLocation.lat}` +
//       `&destination=${selectedStation.coordinates[0]},${selectedStation.coordinates[1]}` +
//       `&access_token=${mapboxgl.accessToken}`;
//     window.open(url, '_blank');
//   };

//   useEffect(() => {
//     getUserLocation();
    
//     // Clean up map on unmount
//     return () => {
//       if (map.current) map.current.remove();
//     };
//   }, []);

//   return (
//     <div className="police-station-locator">
//       <header>
//         <h1>Police Station Locator</h1>
//         <p>Find the nearest police stations and get directions instantly</p>
//       </header>

//       <div className="locator-container">
//         {loading && <div className="loading">Loading your location...</div>}
//         {error && <div className="error">{error}</div>}

//         <div className="station-list">
//           <h2>Nearby Police Stations</h2>
//           {stations.length === 0 && !loading ? (
//             <p className="no-results">No police stations found in your area</p>
//           ) : (
//             <ul>
//               {stations.map(station => (
//                 <li 
//                   key={station.id} 
//                   className={selectedStation?.id === station.id ? 'selected' : ''}
//                   onClick={() => handleStationSelect(station)}
//                 >
//                   <h3>{station.name}</h3>
//                   <p>{station.address}</p>
//                   <p>{station.distance} miles away</p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         <div className="map-details-container">
//           <div className="station-details">
//             {selectedStation ? (
//               <>
//                 <h2>{selectedStation.name}</h2>
//                 <p><strong>Address:</strong> {selectedStation.address}</p>
//                 <p><strong>Distance:</strong> {selectedStation.distance} miles</p>
                
//                 <div className="action-buttons">
//                   <button onClick={getDirections}>
//                     Get Directions
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <div className="no-selection">
//                 <p>Select a police station to view details and get directions</p>
//               </div>
//             )}
//           </div>

//           <div ref={mapContainer} className="map-container" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PoliceStationLocator;



import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styling/PoliceStationLocator.css'; 

// Initialize Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const PoliceStationLocator = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom] = useState(12);

  // Get user's current location and nearby police stations
  const getUserLocation = () => {
    setLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          initializeMap(location);
          try {
            await fetchNearbyPoliceStations(location);
          } catch (err) {
            setError("Failed to fetch police stations");
          }
          setLoading(false);
        },
        (err) => {
          setError("Unable to retrieve your location. Please enable location services.");
          setLoading(false);
          // Fallback to default location (New York)
          const defaultLocation = { lat: 40.7128, lng: -74.0060 };
          setUserLocation(defaultLocation);
          initializeMap(defaultLocation);
          fetchNearbyPoliceStations(defaultLocation);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      // Fallback to default location (New York)
      const defaultLocation = { lat: 40.7128, lng: -74.0060 };
      setUserLocation(defaultLocation);
      initializeMap(defaultLocation);
      fetchNearbyPoliceStations(defaultLocation);
    }
  };

  // Initialize Mapbox map
  const initializeMap = (center) => {
    if (map.current) return; // initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [center.lng, center.lat],
      zoom: zoom
    });

    // Add user location marker
    new mapboxgl.Marker({ color: '#4285F4' })
      .setLngLat([center.lng, center.lat])
      .setPopup(new mapboxgl.Popup().setHTML("<h3>Your Location</h3>"))
      .addTo(map.current);
  };

  // Fetch nearby police stations using Mapbox Geocoding API
  const fetchNearbyPoliceStations = async (location) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/police.json?` +
        `proximity=${location.lng},${location.lat}` +
        `&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const stationsWithDetails = data.features.map((place, index) => ({
          id: place.id || `station-${index}`,
          name: place.text || 'Police Station',
          address: place.place_name,
          coordinates: place.center,
          distance: calculateDistance(
            location.lat, 
            location.lng,
            place.center[1],
            place.center[0]
          )
        }));
        setStations(stationsWithDetails);
        
        // Add markers to map
        stationsWithDetails.forEach(station => {
          new mapboxgl.Marker({ color: '#FF5252' })
            .setLngLat(station.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`
              <h3>${station.name}</h3>
              <p>${station.address}</p>
              <p>${station.distance} miles away</p>
            `))
            .addTo(map.current);
        });
      } else {
        setStations([]);
      }
    } catch (err) {
      console.error("Error fetching police stations:", err);
      setError("Failed to fetch police station data");
    }
  };

  // Calculate distance between two points in miles
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    return (distanceKm * 0.621371).toFixed(1); // Convert to miles
  };

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setShowDirections(false);
    // Center map on selected station
    if (map.current) {
      map.current.flyTo({
        center: station.coordinates,
        zoom: 15
      });
    }
  };

  const toggleDirections = () => {
    if (!selectedStation || !userLocation) return;
    
    setShowDirections(!showDirections);
    
    if (!showDirections) {
      // Add route layer
      getRoute([userLocation.lng, userLocation.lat], selectedStation.coordinates);
    } else {
      // Remove route layer if it exists
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }
    }
  };

  // Get route using Mapbox Directions API
  const getRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${start[0]},${start[1]};${end[0]},${end[1]}?` +
        `geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0].geometry;
        
        // Remove existing route layer if it exists
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }
        
        // Add the route to the map
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 0.75
          }
        });
        
        // Fit the map to the route bounds
        const coordinates = route.coordinates;
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        
        map.current.fitBounds(bounds, {
          padding: 50
        });
      }
    } catch (err) {
      console.error("Error fetching directions:", err);
      setError("Failed to load directions");
    }
  };

  useEffect(() => {
    getUserLocation();
    
    // Clean up map on unmount
    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  return (
    <div className="police-station-locator">
      <header>
        <h1>Police Station Locator</h1>
        <p>Find the nearest police stations and get directions instantly</p>
      </header>

      <div className="locator-container">
        {loading && <div className="loading">Loading your location...</div>}
        {error && <div className="error">{error}</div>}

        <div className="station-list">
          <h2>Nearby Police Stations</h2>
          {stations.length === 0 && !loading ? (
            <p className="no-results">No police stations found in your area</p>
          ) : (
            <ul>
              {stations.map(station => (
                <li 
                  key={station.id} 
                  className={selectedStation?.id === station.id ? 'selected' : ''}
                  onClick={() => handleStationSelect(station)}
                >
                  <h3>{station.name}</h3>
                  <p>{station.address}</p>
                  <p>{station.distance} miles away</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="map-details-container">
          <div className="station-details">
            {selectedStation ? (
              <>
                <h2>{selectedStation.name}</h2>
                <p><strong>Address:</strong> {selectedStation.address}</p>
                <p><strong>Distance:</strong> {selectedStation.distance} miles</p>
                
                <div className="action-buttons">
                  <button 
                    onClick={toggleDirections}
                    className={showDirections ? 'active' : ''}
                  >
                    {showDirections ? 'Hide Directions' : 'Show Directions'}
                  </button>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <p>Select a police station to view details and get directions</p>
              </div>
            )}
          </div>

          <div ref={mapContainer} className="map-container" />
        </div>
      </div>
    </div>
  );
};

export default PoliceStationLocator;