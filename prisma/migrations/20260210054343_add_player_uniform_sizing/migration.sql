-- CreateTable
CREATE TABLE "player_uniform_sizing" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER NOT NULL,
    "jersey_size" VARCHAR(20),
    "hat_size" VARCHAR(20),
    "helmet_size" VARCHAR(20),
    "helmet_side" VARCHAR(20),
    "jersey_pants" VARCHAR(20),
    "pant_style" VARCHAR(50),
    "shirt_size" VARCHAR(20),
    "short_size" VARCHAR(20),
    "youth_belt" VARCHAR(20),
    "adult_belt" VARCHAR(20),
    "sock_size" VARCHAR(20),
    "shoe_size" VARCHAR(20),
    "sweater_jacket" VARCHAR(20),
    "is_catcher" BOOLEAN NOT NULL DEFAULT false,
    "batting_glove" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_uniform_sizing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "player_uniform_sizing_player_id_key" ON "player_uniform_sizing"("player_id");

-- CreateIndex
CREATE INDEX "player_uniform_sizing_player_id_idx" ON "player_uniform_sizing"("player_id");

-- AddForeignKey
ALTER TABLE "player_uniform_sizing" ADD CONSTRAINT "player_uniform_sizing_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
