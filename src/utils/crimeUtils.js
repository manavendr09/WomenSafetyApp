import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../public/firebase/firebase";
/**
 * Get crimes near a location (basic bounding box filter).
 * @param {number} lat
 * @param {number} lng
 * @param {number} radius in degrees (default ~0.01 ≈ 1km)
 * @returns {Promise<Array>}
 */
export const getCrimesNearLocation = async (lat, lng, radius = 0.01) => {
  const crimesRef = collection(db, "crimes");
  const q = query(crimesRef); // No Firestore geo-queries; filtering manually
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => doc.data())
    .filter((crime) => {
      const cLat = crime.location.latitude;
      const cLng = crime.location.longitude;
      return (
        Math.abs(cLat - lat) <= radius && Math.abs(cLng - lng) <= radius
      );
    });
};

/**
 * Assess safety level based on route coordinates
 */
export const assessCrimeAlongRoute = async (coordinates) => {
  let totalCrimes = 0;
  const sampled = coordinates.filter((_, i) => i % 10 === 0); // Sample every ~10th point

  for (const [lng, lat] of sampled) {
    const nearbyCrimes = await getCrimesNearLocation(lat, lng);
    totalCrimes += nearbyCrimes.length;
  }

  if (totalCrimes > 20) return 'red';
  if (totalCrimes > 5) return 'yellow';
  return 'green';
};
