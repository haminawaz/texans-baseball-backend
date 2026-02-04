export interface UpdateCoach {
  coach_id: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface ForgotPassword {
  coach_id: number;
  reset_password_otp: string;
  reset_password_otp_expiry: Date;
}

export interface ResetPassword {
  coach_id: number;
  otp: string;
  new_password: string;
  verify_email?: boolean;
}
