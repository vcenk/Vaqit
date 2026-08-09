import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  /** 0–1 fraction filled. */
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  trackColor: string;
  children?: React.ReactNode;
}

/**
 * A calm circular progress indicator — the compassionate replacement for the
 * streak flame on the Tracker screen. A lighter day simply reads as a lighter
 * ring; there is no "broken" state to punish.
 */
export function ProgressRing({ progress, size, strokeWidth, color, trackColor, children }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashoffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
