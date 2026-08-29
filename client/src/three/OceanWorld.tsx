import React, { useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

import { useOceanStore } from '../store/useOceanStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useMonitoringStore } from '../store/useMonitoringStore';

const AlertMarkers = () => {
  const { alerts } = useMonitoringStore();
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' && a.location);

  return (
    <group>
      {activeAlerts.map(alert => (
        <mesh key={alert.id} position={[(alert.location!.lon - 80) * 0.5, 0.5, (15 - alert.location!.lat) * 0.5]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color={alert.severity === 'CRITICAL' ? '#ff0000' : '#ffa500'} />
          <Html position={[0, 0.5, 0]} center>
            <div className="bg-black/80 text-white text-[10px] p-1 rounded whitespace-nowrap border border-red-500">
              {alert.severity}: {alert.message}
            </div>
          </Html>
        </mesh>
      ))}
    </group>
  );
};

const OceanDataMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectedVariable, layers, selectedTime, selectedDepth, fieldData, dataMode } = useOceanStore();
  const { verticalExaggeration, depthSliceEnabled, bathymetryEnabled, gridEnabled } = useAnalyticsStore();
  
  const resolution = 50;
  const size = 100;
  
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(size, size, resolution, resolution);
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime() + selectedTime;
      const positions = geometry.attributes.position;
      
      // If we have real API fieldData loaded, use it to deform the mesh.
      // NOTE: This assumes fieldData is a flat array of grid points mapped to the resolution.
      // Since resolution is 50x50 = 2500 vertices, we need to map our fieldData (which might be 30x35) onto this.
      // For simplicity in this demo wrapper, we will just use it if length matches, otherwise fallback or interpolate.
      const hasRealData = dataMode === 'api' && fieldData && fieldData.length > 0;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        let z = 0;

        if (hasRealData && i < fieldData.length) {
           // We scale real data value to something visible. E.g. temperature [0,35]
           z = (fieldData[i].value - 15) * 0.2; 
        } else {
           // Fallback / Demo simulation
           z = Math.sin(x * 0.1 + time) * Math.cos(y * 0.1) * 1.5;
           if (selectedVariable === 'temperature') {
             z += Math.sin(y * 0.2 - time) * 0.5;
           } else if (selectedVariable === 'salinity') {
             z += Math.cos(x * 0.15 + time) * 0.8;
           }
        }

        positions.setZ(i, z * verticalExaggeration);
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  });

  const getMaterialColor = () => {
    switch (selectedVariable) {
      case 'temperature': return '#ff4b1f';
      case 'salinity': return '#1fddff';
      case 'current': return '#1f51ff';
      case 'chlorophyll': return '#1fff4b';
      default: return '#00d4ff';
    }
  };

  return (
    <group>
      {layers.model && (
        <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial 
            color={getMaterialColor()} 
            wireframe={!layers.isosurface}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {depthSliceEnabled && (
        <mesh position={[0, -selectedDepth * 0.01 * verticalExaggeration, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color={getMaterialColor()} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}

      {bathymetryEnabled && (
        <mesh position={[0, -20 * verticalExaggeration, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size, size, 20, 20]} />
          <meshStandardMaterial color="#001a33" wireframe={true} />
        </mesh>
      )}

      {gridEnabled && (
        <Grid position={[0, -10 * verticalExaggeration, 0]} args={[100, 100]} cellColor="#444" sectionColor="#888" fadeDistance={50} />
      )}
      
      <AlertMarkers />
    </group>
  );
};

export const OceanWorld: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { visualizationMode } = useOceanStore();

  useEffect(() => {
    const handleReset = () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
        camera.position.set(15, 10, 15);
        camera.lookAt(0, 0, 0);
      }
    };
    window.addEventListener('reset-camera', handleReset);
    return () => window.removeEventListener('reset-camera', handleReset);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.4} color="#a0c4ff" />
      <directionalLight position={[10, 20, 5]} intensity={1.2} color="#ffffff" />
      <hemisphereLight groundColor="#051923" color="#a0c4ff" intensity={0.6} />
      
      {visualizationMode === '3d' && (
        <>
          <OceanDataMesh />
        </>
      )}

      {/* Other modes rely on analytics states handled inside OceanDataMesh or temporarily disabled */}
      {(visualizationMode === 'slices' || visualizationMode === 'vertical' || visualizationMode === 'iso') && (
        <OceanDataMesh />
      )}
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={2}
        maxDistance={60}
        target={[0, -2, 0]}
      />
      <Environment preset="night" />
    </>
  );
};
