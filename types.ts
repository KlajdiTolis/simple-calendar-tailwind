import React from 'react';

export interface MiniEvent {
  id: string;
  title: string;
  description?: string;
  duration: string;
}

export interface TimelineGroup {
  id: number;
  title: string;
  category: 'Development' | 'Design' | 'Marketing' | 'Management';
  color: string;
}

export interface TimelineItem {
  id: number;
  group: number;
  title: string;
  start_time: number; // Unix timestamp in milliseconds
  end_time: number; // Unix timestamp in milliseconds
  description?: string;
  className?: string;
  itemProps?: React.HTMLAttributes<HTMLDivElement>;
  maxMiniEvents?: number;
  miniEvents?: MiniEvent[];
}

export enum GeminiActionType {
  ANALYZE = 'ANALYZE',
  CREATE_EVENT = 'CREATE_EVENT',
}

export interface AIReply {
  text: string;
  suggestedItems?: TimelineItem[];
}