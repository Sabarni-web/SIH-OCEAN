
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { OceanPage } from './pages/OceanPage';
import { ModelDataPage } from './pages/ModelDataPage';
import { ArgoPage } from './pages/ArgoPage';
import { GliderPage } from './pages/GliderPage';
import { CTDPage } from './pages/CTDPage';
import { MooringsPage } from './pages/MooringsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ComparePage } from './pages/ComparePage';
import { UploadPage } from './pages/UploadPage';
import { ApiDownloadPage } from './pages/ApiDownloadPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { DataProvider } from './components/DataProvider';

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="ocean" element={<OceanPage />} />
            <Route path="model-data" element={<ModelDataPage />} />
            <Route path="observations/argo" element={<ArgoPage />} />
            <Route path="observations/gliders" element={<GliderPage />} />
            <Route path="observations/ctd" element={<CTDPage />} />
            <Route path="observations/moorings" element={<MooringsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="api-download" element={<ApiDownloadPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;


