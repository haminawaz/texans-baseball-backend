export interface RegisterPlayer {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  email_verification_otp: string;
  email_verification_otp_expiry: Date;
  team_id: number;
}

export interface Guardian {
  first_name: string;
  last_name: string;
  phone?: string;
  email: string;
  occupation?: string;
  home_address?: string;
}

export interface UpdatePlayer {
  player_id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  age?: number;
  high_school_class?: string;
  positions?: string[];
  jersey_number?: number;
  bat_hand?: string;
  throw_hand?: string;
  height?: string;
  weight?: string;
  high_school?: string;
  sat_score?: number;
  act_score?: number;
  gpa?: number;
  commited_school?: string;
  x_handle?: string;
  instagram_handle?: string;
  facebook_handle?: string;
  guardians?: Guardian[];
}

export interface ForgotPassword {
  player_id: number;
  reset_password_otp: string;
  reset_password_otp_expiry: Date;
}

export interface ResetPassword {
  player_id: number;
  otp: string;
  new_password: string;
}
