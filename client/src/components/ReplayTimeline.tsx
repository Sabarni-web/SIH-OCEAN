import React, { useEffect } from 'react';
import { Play, Pause, X, FastForward, Clock, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';
import { useObservationStore } from '../store/useObservationStore';

export const ReplayTimeline: React.FC = () => {
  const { datePreset } = useObservationStore();
  const {
    replayMode,
    replayLoading,
    replayFrames,
    instrumentSnapshots,
    totalFrames,
    replayMeta,
    currentFrameIndex,
    isReplayPlaying,
    replaySpeed,
    stopReplay,
    toggleReplayPlay,
    setFrameIndex,
    setReplaySpeed,
    advanceFrame
  } = useReplayStore();

  // Animation playback timer
  useEffect(() => {
    if (!isReplayPlaying || totalFrames === 0) return;

    const msPerFrame = Math.max(100, Math.round(450 / replaySpeed));
    const interval = setInterval(() => {
      advanceFrame();
    }, msPerFrame);

    return () => clearInterval(interval);
  }, [isReplayPlaying, replaySpeed, totalFrames, advanceFrame]);

  if (!replayMode) return null;

  const currentFrame = replayFrames[currentFrameIndex];
  const currentSnapshot = instrumentSnapshots[currentFrameIndex];
  const activeCount = currentSnapshot
    ? (currentSnapshot.argos?.length || 0) +
      (currentSnapshot.activeGliderIndices?.length || 0) +
      (currentSnapshot.activeCTDIds?.length || 0) +
      (currentSnapshot.activeBGCIds?.length || 0) +
      10
    : 0;

  const progressPercent = totalFrames > 1 ? (currentFrameIndex / (totalFrames - 1)) * 100 : 0;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-3xl">
      <div className="glass-panel-elevated bg-[#0b1528]/95 border border-cyan-400/50 backdrop-blur-xl p-3.5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex flex-col gap-2.5">
        
        {/* Header: Title, Sampling Strategy, Timestamp & Exit */}
        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            {datePreset === 'live' ? (
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <FastForward className="w-3.5 h-3.5 animate-pulse" /> Forward Forecast
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(251,191,36,0.15)]">
                <History className="w-3.5 h-3.5 animate-spin-slow" /> Temporal Replay
              </span>
            )}
            {replayMeta && (
              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                {replayMeta.totalDays} Days ({replayMeta.samplingStrategy})
              </span>
            )}
          </div>

          {/* Active Frame Timestamp Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-surface/90 border border-cyan-400/40 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold text-white shadow-inner">
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{currentFrame ? currentFrame.label : 'Loading...'}</span>
            </div>

            <button
              onClick={stopReplay}
              className="flex items-center gap-1 text-xs text-textSecondary hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-md transition-colors"
              title="Exit Historical Replay"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Exit</span>
            </button>
          </div>
        </div>

        {/* Progress Slider Track */}
        <div className="relative flex items-center py-1">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalFrames - 1)}
            value={currentFrameIndex}
            onChange={(e) => setFrameIndex(Number(e.target.value))}
            className="w-full h-2 bg-surfaceElevated rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none z-10"
          />
        </div>

        {/* Controls Row: Step, Play/Pause, Speed multiplier, Frame Counter */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          {/* Play / Step Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFrameIndex(currentFrameIndex - 1)}
              disabled={currentFrameIndex <= 0}
              className="p-1.5 rounded-lg bg-surfaceElevated border border-border/60 text-textSecondary hover:text-white disabled:opacity-40 transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={toggleReplayPlay}
              className="px-3.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/60 font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,229,255,0.25)]"
            >
              {isReplayPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-cyan-300" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-cyan-300" /> Play
                </>
              )}
            </button>

            <button
              onClick={() => setFrameIndex(currentFrameIndex + 1)}
              disabled={currentFrameIndex >= totalFrames - 1}
              className="p-1.5 rounded-lg bg-surfaceElevated border border-border/60 text-textSecondary hover:text-white disabled:opacity-40 transition-colors"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Playback Speed Multiplier */}
          <div className="flex items-center gap-1 bg-surfaceElevated/90 border border-border/60 p-0.5 rounded-lg">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setReplaySpeed(speed)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all ${
                  replaySpeed === speed
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-sm'
                    : 'text-textSecondary hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Active Fleet & Frame Counter */}
          <div className="flex items-center gap-2.5 text-[11px] font-mono text-textSecondary">
            {activeCount > 0 && (
              <span className="hidden sm:inline bg-surfaceElevated/90 border border-border/60 px-2 py-0.5 rounded text-amber-300 font-bold">
                {activeCount} Active Sensors
              </span>
            )}
            <div>
              Frame <span className="text-white font-bold">{currentFrameIndex + 1}</span> / {totalFrames}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
