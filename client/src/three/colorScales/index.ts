import * as THREE from 'three';
import { OCEAN_VARIABLES } from '../../data/variables';

export interface ColorScaleConfig {
  stops: { value: number; color: string }[];
}

export const COLOR_SCALES: Record<string, ColorScaleConfig> = {
  thermal: {
    stops: [
      { value: 0.0, color: '#001144' }, // Midnight Blue
      { value: 0.2, color: '#0055ff' }, // Ocean Blue
      { value: 0.4, color: '#00e5ff' }, // Cyan
      { value: 0.6, color: '#44ff00' }, // Lime Green
      { value: 0.8, color: '#ffaa00' }, // Orange/Yellow
      { value: 1.0, color: '#ff0033' }, // Intense Red
    ]
  },
  haline: {
    stops: [
      { value: 0, color: '#e0f3db' },
      { value: 0.5, color: '#a8ddb5' },
      { value: 1, color: '#43a2ca' },
    ]
  },
  algae: {
    stops: [
      { value: 0, color: '#001a00' }, // Very dark green
      { value: 0.2, color: '#004d00' }, // Dark green
      { value: 0.5, color: '#00cc00' }, // Bright green
      { value: 0.8, color: '#aaffaa' }, // Light green
      { value: 1, color: '#ffff00' }, // Yellow peak
    ]
  },
  velocity: {
    stops: [
      { value: 0, color: '#440154' },
      { value: 0.5, color: '#21918c' },
      { value: 1, color: '#fde725' },
    ]
  },
  phase: {
    stops: [
      { value: 0, color: '#00ffff' },   // North: Cyan
      { value: 0.25, color: '#0088ff' }, // East: Light Blue
      { value: 0.5, color: '#0000aa' },  // South: Dark Blue
      { value: 0.75, color: '#0088ff' }, // West: Light Blue
      { value: 1, color: '#00ffff' },   // North: Cyan
    ]
  },
  oxygen: {
    stops: [
      { value: 0, color: '#4b0082' },
      { value: 0.5, color: '#00ffff' },
      { value: 1, color: '#ffffff' },
    ]
  },
  depth: {
    stops: [
      { value: 0, color: '#ffffff' },
      { value: 0.5, color: '#0088ff' },
      { value: 1, color: '#000033' },
    ]
  }
};

// Evaluate a gradient directly using min/max
export const evaluateColor = (value: number, min: number, max: number, config: ColorScaleConfig): THREE.Color => {
  const { stops } = config;
  
  // Clamp value
  const clamped = Math.max(min, Math.min(max, value));
  // Normalize
  const t = max === min ? 0 : (clamped - min) / (max - min);

  // Find appropriate stops
  let lowerStop = stops[0];
  let upperStop = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].value && t <= stops[i+1].value) {
      lowerStop = stops[i];
      upperStop = stops[i+1];
      break;
    }
  }

  // Interpolate
  const localT = (t - lowerStop.value) / (upperStop.value - lowerStop.value || 1);
  const color1 = new THREE.Color(lowerStop.color);
  const color2 = new THREE.Color(upperStop.color);
  
  return color1.lerp(color2, localT);
};

// Generic color getter
export const getVariableColor = (variableId: string, value: number): THREE.Color => {
  const variable = OCEAN_VARIABLES[variableId];
  if (!variable) return new THREE.Color('#ffffff');
  const scale = COLOR_SCALES[variable.colorScale];
  if (!scale) return new THREE.Color('#ffffff');
  
  return evaluateColor(value, variable.min, variable.max, scale);
};
