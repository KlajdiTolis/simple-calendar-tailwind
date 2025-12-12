import React from 'react';

export interface MiniEvent {
  id: string;
  title: string; // Operation Name
  patientName?: string;
  time?: string; // Legacy/Display time
  startTime?: string; // Start time of operation (HH:mm)
  endTime?: string;   // End time of operation (HH:mm)
  operationRoom?: string;
  description?: string;
}

export interface TimelineGroup {
  id: number;
  title: string;
  category: string;
  color: string; // Used for sidebar/avatar
  eventClassName: string; // Used for the actual event blocks
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
  operationRoom?: string;
  
  // Main Event Properties
  isMainEvent?: boolean;
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