import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxSdk from '@mapbox/mapbox-sdk';
import mapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import mapboxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import { getDocs, collection, query, where, limit } from 'firebase/firestore';
import { db } from '../../public/firebase/firebase';
import styles from '../styling/safestroute.module.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function getDistance(coord1, coord2) {
  const R = 6371;
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const lat1 = coord1.lat * Math.PI / 180;
  const lat2 = coord2.lat * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const SafestRoute = () => {

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routesRef = useRef([]);
  
  
  const [destination, setDestination] = useState('');
  const [crimeData, setCrimeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [routeSegments, setRouteSegments] = useState([]);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [safetyScore, setSafetyScore] = useState(null);
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const baseClient = mapboxSdk({ accessToken: mapboxgl.accessToken });
  const directionsClient = mapboxDirections(baseClient);
  const geocodingClient = mapboxGeocoding(baseClient);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [77.2090, 28.6139],
      zoom: 12,
      antialias: true
    });

    map.on('load', () => {
      console.log('Map fully loaded');
      map.resize();

      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      });
      map.addControl(geolocate);
      geolocate.trigger();
    });

    map.on('render', () => {
      if (!map.loaded()) map.resize();
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);


  const clearMap = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    routesRef.current.forEach(route => {
      if (mapInstanceRef.current?.getSource(route.id)) {
        mapInstanceRef.current.removeLayer(route.id);
        mapInstanceRef.current.removeSource(route.id);
      }
    });
    routesRef.current = [];
  }, []);

  
  const analyzeRouteSafety = useCallback((coords, crimes) => {
    if (!coords || coords.length < 2) return { score: 0, highRiskSegments: 0 };

    let totalSeverity = 0;
    let highRiskCount = 0;
    const segments = [];

    for (let i = 0; i < coords.length - 1; i++) {
      const start = { lng: coords[i][0], lat: coords[i][1] };
      const end = { lng: coords[i+1][0], lat: coords[i+1][1] };
      let segmentSeverity = 0;
      let isHighRisk = false;

      for (const crime of crimes) {
        const crimePoint = { lat: crime.lat, lng: crime.long };
        const distance = Math.min(
          getDistance(start, crimePoint),
          getDistance(end, crimePoint)
        );
        
        if (distance <= 1) {
          segmentSeverity += crime.severity;
          if (crime.severity >= 60) isHighRisk = true;
        }
      }

      if (isHighRisk) highRiskCount++;
      totalSeverity += segmentSeverity;
      segments.push({ coordinates: [coords[i], coords[i+1]], isHighRisk, severity: segmentSeverity });
    }

    const avgSeverity = segments.length > 0 ? totalSeverity / segments.length : 0;
    const score = Math.max(0, 100 - (avgSeverity * 0.8)); // Adjusted scoring

    return { score: Math.round(score), highRiskSegments: highRiskCount, segments };
  }, []);


  const fetchCrimeData = useCallback(async (bounds) => {
    try {
      const crimesRef = collection(db, 'crimePoints');
      const q = query(
        crimesRef, 
        where('lat', '>=', bounds.minLat - 0.1),
        where('lat', '<=', bounds.maxLat + 0.1),
        limit(200)
      );
      
      const snapshot = await getDocs(q);
      const crimes = snapshot.docs.map(doc => doc.data());
      setCrimeData(crimes);
      return crimes;
    } catch (error) {
      console.error("Error fetching crimes:", error);
      
      const fallbackCrimes = [
        { lat: 28.6304, long: 77.3721, severity: 60 },
        { lat: 28.6150, long: 77.2090, severity: 70 },
        { lat: 28.5355, long: 77.2410, severity: 50 }
      ];
      setCrimeData(fallbackCrimes);
      return fallbackCrimes;
    }
  }, []);


  const drawRoute = useCallback((route, color, id) => {
    const map = mapInstanceRef.current;
    if (!map) return;

  
    if (map.getSource(id)) {
      map.removeLayer(id);
      map.removeSource(id);
    }

    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: route.geometry.coordinates
        }
      }
    });

    map.addLayer({
      id: id,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': 4,
        'line-opacity': 0.7
      }
    });

    routesRef.current.push({ id, color });
  }, []);


  const getRouteOptions = useCallback(async (start, end) => {
    if (!start || !end) return;

    setLoading(true);
    clearMap();
    setRouteOptions([]);
    setSelectedRoute(null);

    try {
    
      const startMarker = new mapboxgl.Marker({ color: '#0000FF' })
        .setLngLat([start.lng, start.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Start</h3>'))
        .addTo(mapInstanceRef.current);
      
      const endMarker = new mapboxgl.Marker({ color: '#00FFFF' })
        .setLngLat([end.lng, end.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Destination</h3>'))
        .addTo(mapInstanceRef.current);
      
      markersRef.current.push(startMarker, endMarker);

      const bounds = {
        minLng: Math.min(start.lng, end.lng),
        maxLng: Math.max(start.lng, end.lng),
        minLat: Math.min(start.lat, end.lat),
        maxLat: Math.max(start.lat, end.lat)
      };

      const crimes = await fetchCrimeData(bounds);

      const response = await directionsClient.getDirections({
        profile: 'driving',
        waypoints: [
          { coordinates: [start.lng, start.lat] },
          { coordinates: [end.lng, end.lat] }
        ],
        geometries: 'geojson',
        alternatives: true, 
        overview: 'full'
      }).send();

      if (!response.body.routes || response.body.routes.length === 0) {
        throw new Error('No routes found');
      }

      const options = response.body.routes.map((route, index) => {
        const analysis = analyzeRouteSafety(route.geometry.coordinates, crimes);
        return {
          id: `route-${index}`,
          geometry: route.geometry,
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60),
          ...analysis
        };
      });

      options.sort((a, b) => b.score - a.score);

      setRouteOptions(options);

      if (options.length > 0) {
        drawRoute(options[0], '#4CAF50', 'route-safe');
        setSelectedRoute(options[0].id);
        setSafetyScore(options[0].score);
        setRouteSegments(options[0].segments);

        if (options.length > 1) {
          drawRoute(options[options.length - 1], '#F44336', 'route-unsafe');
        }

        const allCoords = options.flatMap(opt => opt.geometry.coordinates);
        const bounds = allCoords.reduce((b, coord) => b.extend(coord), 
          new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]));
        mapInstanceRef.current.fitBounds(bounds, { padding: 60 });
      }

    } catch (error) {
      console.error('Routing error:', error);
      setError(`Failed to get routes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [directionsClient, analyzeRouteSafety, fetchCrimeData, drawRoute, clearMap]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    const coordPattern = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    if (coordPattern.test(destination)) {
      const [lat, lng] = destination.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        const endCoords = { lat, lng };
        const startCoords = userLocation || { lat: 28.63373, lng: 77.44475 };
        getRouteOptions(startCoords, endCoords);
        return;
      }
    }

    if (searchResults.length > 0) {
      const result = searchResults[0];
      const endCoords = result.coordinates;
      const startCoords = userLocation || { lat: 28.63373, lng: 77.44475 };
      getRouteOptions(startCoords, endCoords);
    } else {
      
      setIsSearching(true);
      geocodingClient.forwardGeocode({
        query: destination,
        limit: 1
      }).send()
        .then(response => {
          if (response.body.features.length > 0) {
            const feature = response.body.features[0];
            const endCoords = {
              lng: feature.center[0],
              lat: feature.center[1]
            };
            const startCoords = userLocation || { lat: 28.63373, lng: 77.44475 };
            getRouteOptions(startCoords, endCoords);
          } else {
            setError('Location not found');
          }
        })
        .catch(err => {
          setError('Failed to find location');
          console.error(err);
        })
        .finally(() => setIsSearching(false));
    }
  };


  const handleSampleClick = (placeName) => {
    setDestination(placeName);
    setIsSearching(true);

    geocodingClient.forwardGeocode({
      query: placeName,
      limit: 1
    }).send()
      .then(response => {
        if (response.body.features.length > 0) {
          const feature = response.body.features[0];
          const endCoords = {
            lng: feature.center[0],
            lat: feature.center[1]
          };
          // const userLocation = markersRef.current.find(marker => marker.getLngLat());
          const startCoords = userLocation || { lat: 28.63373, lng: 77.44475 };
          getRouteOptions(startCoords, endCoords);
        } else {
          setError(`Couldn't find "${placeName}"`);
        }
      })
      .catch(err => {
        setError('Failed to find location');
        console.error(err);
      })
      .finally(() => setIsSearching(false));
  };

  const selectRoute = (routeId) => {
    setSelectedRoute(routeId);
    const route = routeOptions.find(r => r.id === routeId);
    if (route) {
      setSafetyScore(route.score);
      setRouteSegments(route.segments);
      
      // Highlight selected route
      routesRef.current.forEach(r => {
        const layer = mapInstanceRef.current.getLayer(r.id);
        if (layer) {
          mapInstanceRef.current.setPaintProperty(
            r.id,
            'line-width',
            r.id === routeId ? 6 : 3
          );
          mapInstanceRef.current.setPaintProperty(
            r.id,
            'line-opacity',
            r.id === routeId ? 0.9 : 0.5
          );
        }
      });
    }
  };

  const sampleDestinations = [
    'Connaught Place, Delhi',
    'India Gate, Delhi',
    'Qutub Minar, Delhi',
    'Akshardham Temple, Delhi'
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>SafeRoute Navigator</h1>
        <p className={styles.subtitle}>Find the safest path to your destination</p>
      </div>

      <div className={styles.gridLayout}>
        {}
        <div>
          <div className={styles.controlPanel}>
            <h2 className={styles.controlTitle}>Plan Your Route</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination"
                className={styles.searchInput}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || isSearching}
                className={styles.searchButton}
              >
                {loading ? 'Finding Routes...' : 'Find Safest Route'}
              </button>
            </form>

            <div className={styles.sampleDestinations}>
              {sampleDestinations.map(place => (
                <button
                  key={place}
                  onClick={() => handleSampleClick(place)}
                  disabled={loading}
                  className={styles.sampleButton}
                >
                  {place.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {routeOptions.length > 0 && (
            <div className={styles.routeOptions}>
              <h2 className={styles.controlTitle}>Route Options</h2>
              {routeOptions.map(route => (
                <div
                  key={route.id}
                  onClick={() => selectRoute(route.id)}
                  className={`${styles.routeOption} ${
                    selectedRoute === route.id ? styles.routeOptionSelected : ''
                  }`}
                >
                  <div className={styles.safetyScore}>
                    <span>
                      {routeOptions.indexOf(route) === 0 ? 'Safest Route' : 
                       routeOptions.indexOf(route) === routeOptions.length - 1 ? 'Fastest Route' : 'Alternative Route'}
                    </span>
                    <span>
                      Safety: {route.score}/100
                    </span>
                  </div>
                  <div className={styles.safetyMeter}>
                    <div 
                      className={styles.safetyFill}
                      style={{
                        width: `${route.score}%`,
                        backgroundColor: route.score > 70 ? '#4CAF50' :
                                         route.score > 40 ? '#FFC107' : '#F44336'
                      }}
                    ></div>
                  </div>
                  <div className={styles.routeStats}>
                    <div className={styles.statBox}>
                      <div className={styles.statLabel}>Distance</div>
                      <div className={styles.statValue}>{route.distance} km</div>
                    </div>
                    <div className={styles.statBox}>
                      <div className={styles.statLabel}>Duration</div>
                      <div className={styles.statValue}>{route.duration} min</div>
                    </div>
                    <div className={styles.statBox}>
                      <div className={styles.statLabel}>High Risk Areas</div>
                      <div className={styles.statValue} style={{ color: '#E53E3E' }}>
                        {route.highRiskSegments}
                      </div>
                    </div>
                    <div className={styles.statBox}>
                      <div className={styles.statLabel}>Route Type</div>
                      <div className={styles.statValue}>
                        {routeOptions.indexOf(route) === 0 ? 'Safest' : 
                         routeOptions.indexOf(route) === routeOptions.length - 1 ? 'Fastest' : 'Alternative'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {}
        <div className={styles.mapContainer}>
          {loading && (
            <div className={styles.mapLoading}>
              <div className={styles.loadingSpinner}></div>
            </div>
          )}
          <div 
            ref={mapRef} 
            className={styles.mapContainer}
            style={{ visibility: loading ? 'hidden' : 'visible' }}
          />
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#0000FF' }}></div>
              <span>Your Location</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#00FFFF' }}></div>
              <span>Destination</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#4CAF50' }}></div>
              <span>Safest Route</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#F44336' }}></div>
              <span>Fastest Route</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#FF5722' }}></div>
              <span>High Crime Area</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SafestRoute;