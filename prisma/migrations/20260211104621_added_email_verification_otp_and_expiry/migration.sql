-- AlterTable
ALTER TABLE "parents" ADD COLUMN     "email_verification_expires_at" TIMESTAMP(3),
ADD COLUMN     "email_verification_otp" VARCHAR(6);
