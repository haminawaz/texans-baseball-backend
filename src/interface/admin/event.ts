import { EventType, RepeatPattern } from "../../generated/prisma";

export interface CreateEvent {
  team_id: number;
  event_type: EventType;
  name: string;
  start_date: Date;
  end_date?: Date;
  start_time: string;
  end_time: string;
  location?: string;
  address: string;
  event_link?: string;
  gamechanger_link?: string;
  notes?: string;
  is_recurring: boolean;
  repeat_pattern?: RepeatPattern;
  repeat_days?: string[];
  end_recurrence_count?: number;
  end_recurrence_date?: Date;
  coach_ids: number[];
}

export interface UpdateEvent extends Partial<CreateEvent> {}
