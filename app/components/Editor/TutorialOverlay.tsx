"use client";

import { useEffect, useMemo, useState } from "react";

export interface TutorialStep {
  target: string;
  text: string;
}

interface TutorialOverlayProps {
  open: boolean;
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

interface TargetBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

const viewportPadding = 18;
const cardHeight = 270;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTargetBox(targetName: string): TargetBox | null {
  if (typeof document === "undefined") return null;
  const target = document.querySelector<HTMLElement>(`[data-tutorial="${targetName}"]`);
  if (!target) return null;
  const rect = target.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

export default function TutorialOverlay({ open, steps, onComplete, onSkip }: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetBox, setTargetBox] = useState<TargetBox | null>(null);

  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (!open || !currentStep) return;

    const target = document.querySelector<HTMLElement>(`[data-tutorial="${currentStep.target}"]`);
    target?.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });

    const updateTarget = () => {
      setTargetBox(getTargetBox(currentStep.target));
    };

    const timer = window.setTimeout(updateTarget, 280);
    updateTarget();

    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [currentStep, open]);

  const placement = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        card: { left: viewportPadding, top: viewportPadding, width: 340 },
        arrowStart: { x: 180, y: 150 },
        arrowEnd: { x: 180, y: 180 },
      };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(360, viewportWidth - viewportPadding * 2);

    if (!targetBox) {
      const left = (viewportWidth - width) / 2;
      const top = Math.max(viewportPadding, viewportHeight * 0.28);
      return {
        card: { left, top, width },
        arrowStart: { x: left + width / 2, y: top + cardHeight },
        arrowEnd: { x: left + width / 2, y: top + cardHeight + 24 },
      };
    }

    const targetCenterX = targetBox.left + targetBox.width / 2;
    const targetCenterY = targetBox.top + targetBox.height / 2;

    if (viewportWidth < 760) {
      const belowTarget = targetCenterY < viewportHeight * 0.52;
      const top = belowTarget
        ? clamp(targetBox.top + targetBox.height + 28, viewportPadding, viewportHeight - cardHeight - viewportPadding)
        : clamp(targetBox.top - cardHeight - 28, viewportPadding, viewportHeight - cardHeight - viewportPadding);
      const left = viewportPadding;
      return {
        card: { left, top, width },
        arrowStart: { x: left + width / 2, y: belowTarget ? top : top + cardHeight },
        arrowEnd: { x: targetCenterX, y: targetCenterY },
      };
    }

    const placeRight = targetCenterX < viewportWidth * 0.56;
    const preferredLeft = placeRight ? targetBox.left + targetBox.width + 42 : targetBox.left - width - 42;
    const left = clamp(preferredLeft, viewportPadding, viewportWidth - width - viewportPadding);
    const top = clamp(targetCenterY - cardHeight / 2, viewportPadding, viewportHeight - cardHeight - viewportPadding);
    const arrowX = placeRight ? left + 10 : left + width - 10;

    return {
      card: { left, top, width },
      arrowStart: { x: arrowX, y: top + cardHeight / 2 },
      arrowEnd: { x: targetCenterX, y: targetCenterY },
    };
  }, [targetBox]);

  if (!open || !currentStep) return null;

  const highlightStyle = targetBox
    ? {
        top: `${targetBox.top - 10}px`,
        left: `${targetBox.left - 10}px`,
        width: `${targetBox.width + 20}px`,
        height: `${targetBox.height + 20}px`,
      }
    : { inset: "18%" };

  const controlLabel = stepIndex === steps.length - 1 ? "I got it" : "I got it";

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none">
      <div
        className="absolute rounded-[1.45rem] border-2 border-white/90 shadow-[0_0_0_9999px_rgba(21,18,16,0.68),0_0_28px_rgba(255,255,255,0.35)] transition-all duration-300"
        style={highlightStyle}
      />

      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <path
          d={`M ${placement.arrowStart.x} ${placement.arrowStart.y} C ${(placement.arrowStart.x + placement.arrowEnd.x) / 2} ${placement.arrowStart.y - 36}, ${(placement.arrowStart.x + placement.arrowEnd.x) / 2} ${placement.arrowEnd.y + 36}, ${placement.arrowEnd.x} ${placement.arrowEnd.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.92)"
          strokeLinecap="round"
          strokeWidth="3"
          strokeDasharray="7 8"
        />
        <path
          d={`M ${placement.arrowEnd.x} ${placement.arrowEnd.y} l -13 -5 m 13 5 l -6 13`}
          fill="none"
          stroke="rgba(255,255,255,0.92)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>

      <div
        className="pointer-events-auto absolute rounded-[1.55rem] border border-white/30 bg-slate-950/74 p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.42)] backdrop-blur-md transition-all duration-300"
        style={{
          left: `${placement.card.left}px`,
          top: `${placement.card.top}px`,
          width: `${placement.card.width}px`,
        }}
      >
        <div className="absolute -left-3 top-6 h-8 w-8 rotate-[-10deg] rounded-sm border border-white/45 bg-white/10" />
        <p className="text-xs uppercase tracking-[0.28em] text-white/68">
          Step {stepIndex + 1} / {steps.length}
        </p>
        <p className="mt-4 font-serif text-[1.65rem] leading-[1.18] tracking-[0] text-white">
          {currentStep.text}
        </p>
        <div className="mt-5 h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.55),rgba(255,255,255,0))]" />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Skip tutorial
          </button>
          <button
            type="button"
            onClick={() => {
              if (stepIndex >= steps.length - 1) {
                onComplete();
                return;
              }
              setStepIndex((current) => current + 1);
            }}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-stone-100"
          >
            {controlLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
