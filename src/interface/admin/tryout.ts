export interface CreateTryout {
  name: string;
  team_id: number;
  age_group: string;
  date: Date;
  time: string;
  address: string;
  registration_deadline: Date;
  notes?: string;
}

export interface UpdateTryout {
  name?: string;
  team_id?: number;
  age_group?: string;
  date?: Date;
  time?: string;
  address?: string;
  registration_deadline?: Date;
  notes?: string;
}
