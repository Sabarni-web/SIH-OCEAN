const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Add the provided API key here
const API_KEY = 'bdcfb7b4-aa1d-11f1-b582-0242ac120004-bdcfb89a-aa1d-11f1-b582-0242ac120004';

// Helper function to inject the API key into all fetch requests
const fetchWithKey = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
    'x-api-key': API_KEY,
    'Authorization': `Bearer ${API_KEY}`
  };
  return fetch(url, { ...options, headers });
};

export const API_BASE_URL = `${BASE_URL}/datasets`;
export const OBS_API_URL = `${BASE_URL}/observations`;
export const COMPARISON_API_URL = `${BASE_URL}/comparison`;

export const datasetService = {
  getDatasets: async () => {
    const res = await fetchWithKey(`${API_BASE_URL}`);
    if (!res.ok) throw new Error('Failed to fetch datasets');
    return res.json();
  },

  getDatasetVariables: async (id: string) => {
    const res = await fetchWithKey(`${API_BASE_URL}/${id}/variables`);
    if (!res.ok) throw new Error('Failed to fetch variables');
    return res.json();
  },

  getOceanField: async (id: string, variable: string, depth: number, time: string, bounds?: any) => {
    let url = `${API_BASE_URL}/${id}/field?variable=${variable}&depth=${depth}&time=${encodeURIComponent(time)}`;
    if (bounds) {
      url += `&minLat=${bounds.minLat}&maxLat=${bounds.maxLat}&minLon=${bounds.minLon}&maxLon=${bounds.maxLon}&latRes=${bounds.latRes}&lonRes=${bounds.lonRes}`;
    }
    const res = await fetchWithKey(url);
    if (!res.ok) throw new Error('Failed to fetch ocean field');
    return res.json();
  },
  
  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetchWithKey(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  getComparisonProfile: async (modelDataset: string, observationId: string, variable: string) => {
    const res = await fetchWithKey(`${COMPARISON_API_URL}/profile?modelDataset=${modelDataset}&observationId=${observationId}&variable=${variable}`);
    if (!res.ok) throw new Error('Failed to fetch comparison');
    return res.json();
  }
};

export const observationService = {
  getObservations: async (params?: string | { type?: string; page?: number; limit?: number; startDate?: string; endDate?: string; minLat?: number; maxLat?: number; minLon?: number; maxLon?: number }, page = 1, limit = 50) => {
    const typeParam = typeof params === 'string' ? params : params?.type;
    const pageParam = typeof params === 'object' && params?.page ? params.page : page;
    const limitParam = typeof params === 'object' && params?.limit ? params.limit : limit;
    const startParam = typeof params === 'object' ? params?.startDate : undefined;
    const endParam = typeof params === 'object' ? params?.endDate : undefined;
    const minLatParam = typeof params === 'object' ? params?.minLat : undefined;
    const maxLatParam = typeof params === 'object' ? params?.maxLat : undefined;
    const minLonParam = typeof params === 'object' ? params?.minLon : undefined;
    const maxLonParam = typeof params === 'object' ? params?.maxLon : undefined;

    const query = new URLSearchParams();
    if (typeParam) query.set('type', typeParam);
    if (pageParam) query.set('page', String(pageParam));
    if (limitParam) query.set('limit', String(limitParam));
    if (startParam) query.set('startDate', startParam);
    if (endParam) query.set('endDate', endParam);
    if (minLatParam !== undefined) query.set('minLat', String(minLatParam));
    if (maxLatParam !== undefined) query.set('maxLat', String(maxLatParam));
    if (minLonParam !== undefined) query.set('minLon', String(minLonParam));
    if (maxLonParam !== undefined) query.set('maxLon', String(maxLonParam));

    const res = await fetchWithKey(`${OBS_API_URL}?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch observations');
    return res.json();
  },

  getObservationById: async (id: string) => {
    const res = await fetchWithKey(`${OBS_API_URL}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch observation');
    return res.json();
  },

  getObservationProfile: async (wmoId: string) => {
    const res = await fetchWithKey(`${OBS_API_URL}/profile/${wmoId}`);
    if (!res.ok) throw new Error('Failed to fetch observation profile');
    return res.json();
  }
};

export const CURRENTS_API_URL = `${BASE_URL}/currents`;

export const currentsService = {
  getCurrents: async (date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await fetchWithKey(`${CURRENTS_API_URL}${query}`);
    if (!res.ok) throw new Error('Failed to fetch currents');
    return res.json();
  },

  getTimeline: async (startDate: string, endDate: string, bounds?: any) => {
    let url = `${CURRENTS_API_URL}/timeline?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    if (bounds) {
      url += `&minLat=${bounds.minLat}&maxLat=${bounds.maxLat}&minLon=${bounds.minLon}&maxLon=${bounds.maxLon}`;
    }
    const res = await fetchWithKey(url);
    if (!res.ok) throw new Error('Failed to fetch currents timeline');
    return res.json();
  }
};


