import React from 'react';

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
}

export enum GeminiActionType {
  ANALYZE = 'ANALYZE',
  CREATE_EVENT = 'CREATE_EVENT',
}

export interface AIReply {
  text: string;
  suggestedItems?: TimelineItem[];
}