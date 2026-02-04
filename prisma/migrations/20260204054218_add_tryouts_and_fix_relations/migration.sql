-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Tournament', 'Practice', 'Social_Event', 'Strength_Conditioning');

-- CreateEnum
CREATE TYPE "RepeatPattern" AS ENUM ('Weekly', 'Every_Two_Weeks');

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
CREATE INDEX "_CoachesToEvents_B_index" ON "_CoachesToEvents"("B");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachesToEvents" ADD CONSTRAINT "_CoachesToEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachesToEvents" ADD CONSTRAINT "_CoachesToEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
