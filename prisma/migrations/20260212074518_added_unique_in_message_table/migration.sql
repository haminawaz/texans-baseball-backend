-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_message_id_coach_id_key" ON "message_reactions"("message_id", "coach_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_message_id_player_id_key" ON "message_reactions"("message_id", "player_id");
