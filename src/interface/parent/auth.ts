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

export interface ParentSignup {
  player_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  relationship: string;
  email_verification_otp: string;
  email_verification_expires_at: Date;
}

export interface ForgotPassword {
  parent_id: number;
  reset_password_otp: string;
  reset_password_otp_expiry: Date;
}

export interface ResetPassword {
  parent_id: number;
  otp: string;
  new_password: string;
  verify_email?: boolean;
}
