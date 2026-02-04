-- CreateEnum
CREATE TYPE "CoachRole" AS ENUM ('coach', 'assistant_coach');

-- CreateEnum
CREATE TYPE "PermissionLevel" AS ENUM ('read_only', 'full_access');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Tournament', 'Practice', 'Social_Event', 'Strength_Conditioning');

-- CreateEnum
CREATE TYPE "RepeatPattern" AS ENUM ('Weekly', 'Every_Two_Weeks');

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaches" (
    "id" SERIAL NOT NULL,
    "profile_picture" VARCHAR(255),
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(20),
    "password" TEXT,
    "role" "CoachRole" NOT NULL DEFAULT 'coach',
    "permission_level" "PermissionLevel" NOT NULL DEFAULT 'read_only',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "reset_password_otp" VARCHAR(6),
    "reset_password_otp_expires_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER,
    "profile_picture" VARCHAR(255),
    "hero_image" VARCHAR(255),
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" TEXT NOT NULL,
    "phone" VARCHAR(50),
    "date_of_birth" TIMESTAMP(3),
    "age" INTEGER,
    "high_school_class" VARCHAR(20),
    "positions" TEXT[],
    "jersey_number" INTEGER,
    "bat_hand" VARCHAR(20),
    "throw_hand" VARCHAR(20),
    "height" VARCHAR(20),
    "weight" VARCHAR(20),
    "high_school" VARCHAR(20),
    "sat_score" INTEGER,
    "act_score" INTEGER,
    "gpa" DOUBLE PRECISION,
    "commited_school" VARCHAR(20),
    "instagram_handle" VARCHAR(20),
    "facebook_handle" VARCHAR(20),
    "x_handle" VARCHAR(20),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_otp" VARCHAR(6),
    "email_verification_expires_at" TIMESTAMP(3),
    "reset_password_otp" VARCHAR(6),
    "reset_password_expires_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "guardians" JSONB DEFAULT '[]',

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "logo" VARCHAR(255),
    "name" VARCHAR(100) NOT NULL,
    "age_group" VARCHAR(20) NOT NULL,
    "unique_code" VARCHAR(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_coaches" (
    "team_id" INTEGER NOT NULL,
    "coach_id" INTEGER NOT NULL,

    CONSTRAINT "team_coaches_pkey" PRIMARY KEY ("team_id","coach_id")
);

-- CreateTable
CREATE TABLE "tryouts" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "age_group" VARCHAR(50) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" VARCHAR(20) NOT NULL,
    "address" TEXT NOT NULL,
    "registration_deadline" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tryouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "event_type" "EventType" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "start_time" VARCHAR(20) NOT NULL,
    "end_time" VARCHAR(20) NOT NULL,
    "location" VARCHAR(255),
    "address" TEXT NOT NULL,
    "event_link" TEXT,
    "gamechanger_link" TEXT,
    "notes" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "repeat_pattern" "RepeatPattern",
    "repeat_days" TEXT[],
    "end_recurrence_count" INTEGER,
    "end_recurrence_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoachesToEvents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CoachesToEvents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE INDEX "admin_email_idx" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "coaches_email_key" ON "coaches"("email");

-- CreateIndex
CREATE INDEX "coaches_email_idx" ON "coaches"("email");

-- CreateIndex
CREATE UNIQUE INDEX "players_email_key" ON "players"("email");

-- CreateIndex
CREATE INDEX "players_email_idx" ON "players"("email");

-- CreateIndex
CREATE INDEX "players_team_id_idx" ON "players"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_unique_code_key" ON "teams"("unique_code");

-- CreateIndex
CREATE INDEX "tryouts_team_id_idx" ON "tryouts"("team_id");

-- CreateIndex
CREATE INDEX "_CoachesToEvents_B_index" ON "_CoachesToEvents"("B");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_coaches" ADD CONSTRAINT "team_coaches_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_coaches" ADD CONSTRAINT "team_coaches_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tryouts" ADD CONSTRAINT "tryouts_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachesToEvents" ADD CONSTRAINT "_CoachesToEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachesToEvents" ADD CONSTRAINT "_CoachesToEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
