export interface CreateParent {
  first_name: string;
  last_name: string;
  email: string;
  relationship?: string;
  invitation_token?: string;
  invitation_expires_at?: Date;
}

export interface CreatePlayerParent {
  player_id: number;
  parent_id: number;
  relationship?: string;
  invitation_token?: string;
  invitation_expires_at?: Date;
}
