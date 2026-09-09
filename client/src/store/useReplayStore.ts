import { create } from 'zustand';
import { currentsService } from '../services/api';
import { useAnalyticsStore } from './useAnalyticsStore';
import { useOceanStore } from './useOceanStore';
import type { TimelineFrame, TimelineResponse, InstrumentSnapshot } from '../../../shared/types';

interface ReplayState {
  // Mode
  replayMode: boolean;
  replayLoading: boolean;

  // Frame Data (Stored in RAM)
  replayFrames: TimelineFrame[];
  instrumentSnapshots: InstrumentSnapshot[];
  totalFrames: number;
  replayMeta: TimelineResponse['meta'] | null;

  // Playback Controls
  currentFrameIndex: number;
  isReplayPlaying: boolean;
  replaySpeed: number; // 1, 2, or 4 (multiplier)

  // Actions
  startReplay: (startDate: string, endDate: string) => Promise<void>;
  stopReplay: () => void;
  toggleReplayPlay: () => void;
  setFrameIndex: (idx: number) => void;
  setReplaySpeed: (speed: number) => void;
  advanceFrame: () => void;
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  replayMode: false,
  replayLoading: false,

  replayFrames: [],
  instrumentSnapshots: [],
  totalFrames: 0,
  replayMeta: null,

  currentFrameIndex: 0,
  isReplayPlaying: false,
  replaySpeed: 1,

  startReplay: async (startDate: string, endDate: string) => {
    set({ replayLoading: true, replayMode: true, isReplayPlaying: false });

    // Auto-enable vector grid & particle flow so the user immediately sees the visualizer
    const analytics = useAnalyticsStore.getState();
    if (!analytics.vectorEnabled && !analytics.particleEnabled) {
      analytics.setVectorEnabled(true);
      analytics.setParticleEnabled(true);
    } else if (!analytics.vectorEnabled) {
      analytics.setVectorEnabled(true);
    }

    try {
      const bounds = useOceanStore.getState().viewBounds;
      const res: TimelineResponse = await currentsService.getTimeline(startDate, endDate, bounds);
      if (res && res.frames && res.frames.length > 0) {
        set({
          replayFrames: res.frames,
          instrumentSnapshots: res.instrumentSnapshots || [],
          totalFrames: res.frames.length,
          replayMeta: res.meta,
          currentFrameIndex: 0,
          isReplayPlaying: true,
          replayLoading: false
        });

        // Announce the forecast using Web Speech API
        try {
          // Calculate max speed for the briefing
          let maxSpeed = 0;
          res.frames.forEach(f => {
            f.vectors.forEach(v => {
              if (v.speed > maxSpeed) maxSpeed = v.speed;
            });
          });
          const speedStr = maxSpeed.toFixed(1);

          // Get current ocean region
          const regionKey = useOceanStore.getState().selectedRegion;
          const regionMap: Record<string, string> = {
            'global': 'Global Ocean',
            'indian_ocean': 'Indian Ocean',
            'pacific_ocean': 'Pacific Ocean',
            'atlantic_ocean': 'Atlantic Ocean',
            'southern_ocean': 'Southern Ocean',
            'arctic_ocean': 'Arctic Ocean'
          };
          const regionName = regionMap[regionKey] || 'Indian Ocean';

          window.speechSynthesis.cancel();
          const msg = new SpeechSynthesisUtterance(`Predicting the next 3 days for the ${regionName}. Ocean currents are expected to reach a maximum velocity of ${speedStr} meters per second. Commencing forecast simulation.`);
          msg.rate = 1.0;
          msg.pitch = 1.0;
          window.speechSynthesis.speak(msg);
        } catch (e) {
          console.warn("Text-to-speech failed:", e);
        }
      } else {
        console.warn('No temporal replay frames returned from service');
        set({ replayLoading: false, replayMode: false });
      }
    } catch (err) {
      console.error('Failed to start temporal replay:', err);
      set({ replayLoading: false, replayMode: false });
    }
  },

  stopReplay: () => {
    set({
      replayMode: false,
      isReplayPlaying: false,
      currentFrameIndex: 0
    });
  },

  toggleReplayPlay: () => {
    set((state) => ({ isReplayPlaying: !state.isReplayPlaying }));
  },

  setFrameIndex: (idx: number) => {
    const { totalFrames } = get();
    const clamped = Math.max(0, Math.min(idx, totalFrames - 1));
    set({ currentFrameIndex: clamped });
  },

  setReplaySpeed: (speed: number) => {
    set({ replaySpeed: speed });
  },

  advanceFrame: () => {
    const { currentFrameIndex, totalFrames, isReplayPlaying } = get();
    if (!isReplayPlaying || totalFrames === 0) return;
    const next = currentFrameIndex + 1;
    if (next >= totalFrames) {
      // Loop back to start
      set({ currentFrameIndex: 0 });
    } else {
      set({ currentFrameIndex: next });
    }
  }
}));
