import { CoachRole, PermissionLevel } from "../../generated/prisma";

export interface InviteCoach {
  first_name: string;
  last_name: string;
  email: string;
  role: CoachRole;
  permission_level: PermissionLevel;
  reset_password_otp: string;
  reset_password_otp_expires_at: Date;
}
