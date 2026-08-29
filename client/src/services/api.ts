export const API_BASE_URL = 'http://localhost:5000/api/datasets';
export const OBS_API_URL = 'http://localhost:5000/api/observations';

export const datasetService = {
  getDatasets: async () => {
    const res = await fetch(`${API_BASE_URL}`);
    if (!res.ok) throw new Error('Failed to fetch datasets');
    return res.json();
  },

  getDatasetVariables: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/${id}/variables`);
    if (!res.ok) throw new Error('Failed to fetch variables');
    return res.json();
  },

  getOceanField: async (id: string, variable: string, depth: number, time: string) => {
    const res = await fetch(`${API_BASE_URL}/${id}/field?variable=${variable}&depth=${depth}&time=${time}`);
    if (!res.ok) throw new Error('Failed to fetch ocean field');
    return res.json();
  },
  
  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  getComparisonProfile: async (modelDataset: string, observationId: string, variable: string) => {
    const res = await fetch(`http://localhost:5000/api/comparison/profile?modelDataset=${modelDataset}&observationId=${observationId}&variable=${variable}`);
    if (!res.ok) throw new Error('Failed to fetch comparison');
    return res.json();
  }
};

export const observationService = {
  getObservations: async (type?: string, page = 1, limit = 50) => {
    const url = type ? `${OBS_API_URL}/type/${type}?page=${page}&limit=${limit}` : `${OBS_API_URL}?page=${page}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch observations');
    return res.json();
  },

  getObservationById: async (id: string) => {
    const res = await fetch(`${OBS_API_URL}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch observation');
    return res.json();
  }
};

