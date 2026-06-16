-- Composite indexes for public pages and ranking queries.

-- D-Cup public match lists, team detail pages, group standings and knockout bracket.
CREATE INDEX "Match_status_startsAt_idx" ON "Match"("status", "startsAt");
CREATE INDEX "Match_groupId_status_idx" ON "Match"("groupId", "status");
CREATE INDEX "Match_knockoutRoundId_status_bracketPosition_idx" ON "Match"("knockoutRoundId", "status", "bracketPosition");
CREATE INDEX "Match_homeTeamId_status_startsAt_idx" ON "Match"("homeTeamId", "status", "startsAt");
CREATE INDEX "Match_awayTeamId_status_startsAt_idx" ON "Match"("awayTeamId", "status", "startsAt");

-- Public bonus pages and scorer aggregations.
CREATE INDEX "BonusType_isSecret_points_name_idx" ON "BonusType"("isSecret", "points", "name");
CREATE INDEX "BonusType_isSecret_name_idx" ON "BonusType"("isSecret", "name");
CREATE INDEX "MatchGoal_scorerId_isOwnGoal_idx" ON "MatchGoal"("scorerId", "isOwnGoal");

-- Fantasy player ownership lookups.
CREATE INDEX "FantasyTeamPlayer_playerId_fantasyTeamId_idx" ON "FantasyTeamPlayer"("playerId", "fantasyTeamId");

-- GreenVolley public match lists, team detail pages, standings and knockout bracket.
CREATE INDEX "VolleyTeam_name_idx" ON "VolleyTeam"("name");
CREATE INDEX "VolleyPlayer_teamId_name_idx" ON "VolleyPlayer"("teamId", "name");
CREATE INDEX "VolleyMatch_status_date_idx" ON "VolleyMatch"("status", "date");
CREATE INDEX "VolleyMatch_groupId_status_idx" ON "VolleyMatch"("groupId", "status");
CREATE INDEX "VolleyMatch_knockoutRoundId_status_date_idx" ON "VolleyMatch"("knockoutRoundId", "status", "date");
CREATE INDEX "VolleyMatch_homeTeamId_status_date_idx" ON "VolleyMatch"("homeTeamId", "status", "date");
CREATE INDEX "VolleyMatch_awayTeamId_status_date_idx" ON "VolleyMatch"("awayTeamId", "status", "date");
CREATE INDEX "VolleyGroupTeam_teamId_idx" ON "VolleyGroupTeam"("teamId");
CREATE INDEX "VolleyKnockoutRound_order_idx" ON "VolleyKnockoutRound"("order");
