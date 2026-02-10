-- CreateTable
CREATE TABLE "coach_uniform_sizing" (
    "id" SERIAL NOT NULL,
    "coach_id" INTEGER NOT NULL,
    "hat_size" VARCHAR(20),
    "shirt_size" VARCHAR(20),
    "short_size" VARCHAR(20),
    "long_sleeves" VARCHAR(20),
    "hoodie_size" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_uniform_sizing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coach_uniform_sizing_coach_id_key" ON "coach_uniform_sizing"("coach_id");

-- CreateIndex
CREATE INDEX "coach_uniform_sizing_coach_id_idx" ON "coach_uniform_sizing"("coach_id");

-- AddForeignKey
ALTER TABLE "coach_uniform_sizing" ADD CONSTRAINT "coach_uniform_sizing_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
