export interface Point {
  lat: number;
  lon: number;
  depth: number;
  value: number;
}

/**
 * Inverse Distance Weighting (IDW) interpolation
 * Interpolates scattered point data onto a regular grid.
 * @param points Array of known data points
 * @param lats Array of target grid latitudes
 * @param lons Array of target grid longitudes
 * @param targetDepth The depth of the target grid
 * @param p Power parameter (typically 2)
 * @returns Array of interpolated values matching the target grid
 */
export const interpolateIDW = (
  points: Point[],
  lats: number[],
  lons: number[],
  targetDepth: number,
  p: number = 2
): Point[] => {
  if (!points || points.length === 0) return [];

  const gridPoints: Point[] = [];

  for (const lat of lats) {
    for (const lon of lons) {
      let sumWeights = 0;
      let sumValues = 0;
      let exactMatchValue: number | null = null;

      for (const pt of points) {
        // Calculate Euclidean distance (simple approximation for small bounding boxes)
        const dLat = lat - pt.lat;
        const dLon = lon - pt.lon;
        const distanceSq = dLat * dLat + dLon * dLon;

        // If distance is extremely small, use the exact point value
        if (distanceSq < 1e-10) {
          exactMatchValue = pt.value;
          break;
        }

        const weight = 1 / Math.pow(distanceSq, p / 2);
        sumWeights += weight;
        sumValues += pt.value * weight;
      }

      if (exactMatchValue !== null) {
        gridPoints.push({ lat, lon, depth: targetDepth, value: exactMatchValue });
      } else if (sumWeights > 0) {
        gridPoints.push({ lat, lon, depth: targetDepth, value: sumValues / sumWeights });
      } else {
        // Fallback to average of all points if something goes wrong
        const avg = points.reduce((acc, pt) => acc + pt.value, 0) / points.length;
        gridPoints.push({ lat, lon, depth: targetDepth, value: avg });
      }
    }
  }

  return gridPoints;
};
