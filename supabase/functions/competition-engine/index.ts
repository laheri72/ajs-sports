import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { max: 1, prepare: false });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin role required");

    const body = await req.json();
    let result: any;

    switch (body.action) {
      case "generate_participations":
        result = await sql.begin((tx: any) => generateParticipations(tx, body.seasonId));
        break;
      case "generate_teams":
        result = await sql.begin((tx: any) => generateTeams(tx, body.seasonId));
        break;
      case "generate_fixtures":
        result = await sql.begin((tx: any) => generateFixtures(tx, body.seasonId));
        break;
      case "generate_playoffs":
        result = await sql.begin((tx: any) => generatePlayoffs(tx, body.seasonId));
        break;
      case "record_result":
        result = await sql.begin((tx: any) =>
          recordResult(tx, body.matchId, body.homeScore, body.awayScore, body.winnerId)
        );
        break;
      case "compute_standings":
        result = await sql.begin((tx: any) => computeStandings(tx, body.seasonId));
        break;
      default:
        throw new Error("Unknown action: " + body.action);
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    await sql.end();
  }
});

// ─── GENERATE PARTICIPATIONS ────────────────────────────────────
async function generateParticipations(tx: any, seasonId: string) {
  const selections = await tx`
    SELECT * FROM student_selections
    WHERE season_id = ${seasonId} AND is_final = true AND is_locked = true
  `;
  if (!selections.length) throw new Error("No final locked selections found for this season");

  const events = await tx`
    SELECT id, sport_id, sub_category, age_group, is_team_event
    FROM events WHERE season_id = ${seasonId}
  `;

  const existing = await tx`
    SELECT student_id, event_id FROM participations WHERE season_id = ${seasonId}
  `;
  const existingSet = new Set(existing.map((p: any) => `${p.student_id}_${p.event_id}`));

  const rows: any[] = [];
  let skipped = 0;

  for (const sel of selections) {
    const event = events.find(
      (e: any) =>
        e.sport_id === sel.sport_id &&
        (e.sub_category === sel.category || e.age_group === sel.category)
    );
    if (!event) { skipped++; continue; }

    const key = `${sel.student_id}_${event.id}`;
    if (existingSet.has(key)) { skipped++; continue; }

    rows.push({
      student_id: sel.student_id,
      event_id: event.id,
      season_id: seasonId,
      house_id: sel.house_id,
      status: "selected",
    });
    existingSet.add(key);
  }

  if (rows.length > 0) {
    await tx`
      INSERT INTO participations ${tx(rows, "student_id", "event_id", "season_id", "house_id", "status")}
    `;
  }

  return {
    step: "generate_participations",
    created: rows.length,
    skipped,
    message: `Created ${rows.length} participations (${skipped} skipped)`,
  };
}

// ─── GENERATE TEAMS (rank-based) ────────────────────────────────
async function generateTeams(tx: any, seasonId: string) {
  const events = await tx`
    SELECT id, name, is_team_event, playing_lineup, substitutes, sport_id
    FROM events
    WHERE season_id = ${seasonId} AND is_team_event = true
  `;
  if (!events.length) throw new Error("No team events found for this season");

  const parts = await tx`
    SELECT p.id, p.student_id, p.event_id, p.house_id,
           COALESCE(ss.rank, 999) AS selection_rank
    FROM participations p
    JOIN events e ON e.id = p.event_id
    LEFT JOIN student_selections ss
      ON ss.student_id = p.student_id
      AND ss.season_id = p.season_id
      AND ss.sport_id = e.sport_id
      AND ss.house_id = p.house_id
    WHERE p.season_id = ${seasonId} AND p.status = 'selected'
    ORDER BY p.event_id, p.house_id, COALESCE(ss.rank, 999) ASC
  `;

  const houses = await tx`SELECT id, name FROM houses`;
  const houseMap = Object.fromEntries(houses.map((h: any) => [h.id, h.name]));

  const eventIds = events.map((e: any) => e.id);
  const existingTeams = await tx`
    SELECT id, event_id, house_id FROM teams WHERE event_id = ANY(${eventIds})
  `;
  const existingTeamSet = new Set(
    existingTeams.map((t: any) => `${t.event_id}_${t.house_id}`)
  );

  let teamsCreated = 0;
  let membersCreated = 0;
  let teamsSkipped = 0;

  for (const event of events) {
    const eventParts = parts.filter((p: any) => p.event_id === event.id);
    const byHouse: Record<string, any[]> = {};
    for (const p of eventParts) {
      if (!byHouse[p.house_id]) byHouse[p.house_id] = [];
      byHouse[p.house_id].push(p);
    }

    for (const [houseId, houseParts] of Object.entries(byHouse)) {
      const key = `${event.id}_${houseId}`;
      if (existingTeamSet.has(key)) { teamsSkipped++; continue; }

      const teamName = `${houseMap[houseId] || "House"} - ${event.name}`;
      const [team] = await tx`
        INSERT INTO teams (name, event_id, house_id)
        VALUES (${teamName}, ${event.id}, ${houseId})
        RETURNING id
      `;
      teamsCreated++;

      const lineup = event.playing_lineup || houseParts.length;
      const maxMembers = lineup + (event.substitutes || 0);
      const memberRows = houseParts.slice(0, maxMembers).map((p: any, i: number) => ({
        team_id: team.id,
        student_id: p.student_id,
        role: i < lineup ? "player" : "substitute",
      }));

      if (memberRows.length > 0) {
        await tx`
          INSERT INTO team_members ${tx(memberRows, "team_id", "student_id", "role")}
        `;
        membersCreated += memberRows.length;
      }
    }
  }

  return {
    step: "generate_teams",
    created: teamsCreated,
    skipped: teamsSkipped,
    members: membersCreated,
    message: `Created ${teamsCreated} teams with ${membersCreated} members (${teamsSkipped} skipped)`,
  };
}

// ─── GENERATE FIXTURES (group stage) ────────────────────────────
async function generateFixtures(tx: any, seasonId: string) {
  const events = await tx`
    SELECT id, name, is_team_event
    FROM events
    WHERE season_id = ${seasonId} AND is_team_event = true
  `;
  if (!events.length) throw new Error("No team events to generate fixtures for");

  const existingMatches = await tx`
    SELECT DISTINCT event_id FROM matches WHERE season_id = ${seasonId} AND stage = 'group'
  `;
  const eventsWithMatches = new Set(existingMatches.map((m: any) => m.event_id));

  let matchesCreated = 0;
  let standingsCreated = 0;
  let eventsSkipped = 0;

  for (const event of events) {
    if (eventsWithMatches.has(event.id)) { eventsSkipped++; continue; }

    const teams = await tx`
      SELECT id, house_id FROM teams WHERE event_id = ${event.id}
    `;
    if (teams.length < 2) continue;

    const matchRows: any[] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matchRows.push({
          event_id: event.id,
          season_id: seasonId,
          home_team_id: teams[i].id,
          away_team_id: teams[j].id,
          stage: "group",
        });
      }
    }

    if (matchRows.length > 0) {
      await tx`
        INSERT INTO matches ${tx(matchRows, "event_id", "season_id", "home_team_id", "away_team_id", "stage")}
      `;
      matchesCreated += matchRows.length;
    }

    const existingStandings = await tx`
      SELECT team_id FROM team_standings
      WHERE event_id = ${event.id} AND season_id = ${seasonId}
    `;
    const existingStandingTeams = new Set(existingStandings.map((s: any) => s.team_id));

    const standingRows = teams
      .filter((t: any) => !existingStandingTeams.has(t.id))
      .map((t: any) => ({
        team_id: t.id,
        event_id: event.id,
        season_id: seasonId,
        played: 0, won: 0, lost: 0, drawn: 0,
        points: 0, goal_diff: 0, goals_for: 0, goals_against: 0, net_run_rate: 0,
      }));

    if (standingRows.length > 0) {
      await tx`
        INSERT INTO team_standings ${tx(standingRows,
          "team_id", "event_id", "season_id",
          "played", "won", "lost", "drawn",
          "points", "goal_diff", "goals_for", "goals_against", "net_run_rate"
        )}
      `;
      standingsCreated += standingRows.length;
    }
  }

  return {
    step: "generate_fixtures",
    created: matchesCreated,
    skipped: eventsSkipped,
    standings: standingsCreated,
    message: `Created ${matchesCreated} group stage fixtures (${eventsSkipped} events skipped)`,
  };
}

// ─── GENERATE PLAYOFFS ─────────────────────────────────────────
async function generatePlayoffs(tx: any, seasonId: string) {
  const events = await tx`
    SELECT id, name, is_team_event
    FROM events
    WHERE season_id = ${seasonId} AND is_team_event = true
  `;
  if (!events.length) throw new Error("No team events found");

  let matchesCreated = 0;
  let eventsSkipped = 0;

  for (const event of events) {
    // Idempotency: skip if playoff matches already exist for this event
    const existingPlayoffs = await tx`
      SELECT id FROM matches
      WHERE event_id = ${event.id} AND season_id = ${seasonId}
        AND stage != 'group'
      LIMIT 1
    `;
    if (existingPlayoffs.length > 0) { eventsSkipped++; continue; }

    // Get standings ordered by tiebreakers
    const standings = await tx`
      SELECT ts.team_id, t.house_id, t.name as team_name
      FROM team_standings ts
      JOIN teams t ON t.id = ts.team_id
      WHERE ts.event_id = ${event.id} AND ts.season_id = ${seasonId}
      ORDER BY ts.points DESC, ts.goal_diff DESC, ts.goals_for DESC
    `;

    if (standings.length < 2) continue;

    if (standings.length === 4) {
      // 4-team bracket: SF1 (1v4), SF2 (2v3), Final, Third Place
      const [seed1, seed2, seed3, seed4] = standings;

      // Create semifinal matches
      const [sf1] = await tx`
        INSERT INTO matches (event_id, season_id, home_team_id, away_team_id, stage)
        VALUES (${event.id}, ${seasonId}, ${seed1.team_id}, ${seed4.team_id}, 'semifinal')
        RETURNING id
      `;
      const [sf2] = await tx`
        INSERT INTO matches (event_id, season_id, home_team_id, away_team_id, stage)
        VALUES (${event.id}, ${seasonId}, ${seed2.team_id}, ${seed3.team_id}, 'semifinal')
        RETURNING id
      `;

      // Create final (teams TBD — filled on semifinal result)
      await tx`
        INSERT INTO matches (event_id, season_id, stage)
        VALUES (${event.id}, ${seasonId}, 'final')
      `;

      // Create third place match (teams TBD)
      await tx`
        INSERT INTO matches (event_id, season_id, stage)
        VALUES (${event.id}, ${seasonId}, 'third_place')
      `;

      matchesCreated += 4;
    } else if (standings.length >= 8) {
      // 8+ teams: QF from top 8, then SF, F, 3rd place
      const top8 = standings.slice(0, 8);
      // QF: 1v8, 2v7, 3v6, 4v5
      const qfPairs = [[0,7],[1,6],[2,5],[3,4]];
      for (const [a, b] of qfPairs) {
        await tx`
          INSERT INTO matches (event_id, season_id, home_team_id, away_team_id, stage)
          VALUES (${event.id}, ${seasonId}, ${top8[a].team_id}, ${top8[b].team_id}, 'quarterfinal')
        `;
      }
      // SF placeholders
      await tx`INSERT INTO matches (event_id, season_id, stage) VALUES (${event.id}, ${seasonId}, 'semifinal')`;
      await tx`INSERT INTO matches (event_id, season_id, stage) VALUES (${event.id}, ${seasonId}, 'semifinal')`;
      // Final + 3rd place placeholders
      await tx`INSERT INTO matches (event_id, season_id, stage) VALUES (${event.id}, ${seasonId}, 'final')`;
      await tx`INSERT INTO matches (event_id, season_id, stage) VALUES (${event.id}, ${seasonId}, 'third_place')`;
      matchesCreated += 8;
    } else {
      // 2-3 teams: just do a final between top 2
      const [seed1, seed2] = standings;
      await tx`
        INSERT INTO matches (event_id, season_id, home_team_id, away_team_id, stage)
        VALUES (${event.id}, ${seasonId}, ${seed1.team_id}, ${seed2.team_id}, 'final')
      `;
      matchesCreated += 1;
      if (standings.length === 3) {
        // third place match not needed, 3rd is auto
      }
    }
  }

  return {
    step: "generate_playoffs",
    created: matchesCreated,
    skipped: eventsSkipped,
    message: `Created ${matchesCreated} playoff matches (${eventsSkipped} events skipped)`,
  };
}

// ─── RECORD RESULT (with playoff advancement) ──────────────────
async function recordResult(
  tx: any,
  matchId: string,
  homeScore: number,
  awayScore: number,
  winnerId: string | null
) {
  const [match] = await tx`
    SELECT id, event_id, season_id, home_team_id, away_team_id, stage
    FROM matches WHERE id = ${matchId}
  `;
  if (!match) throw new Error("Match not found");

  await tx`
    UPDATE matches
    SET home_score = ${homeScore}, away_score = ${awayScore}, winner_team_id = ${winnerId}
    WHERE id = ${matchId}
  `;

  const isDraw = homeScore === awayScore;

  // Update standings for group stage matches
  if (match.stage === "group") {
    if (match.home_team_id) {
      await updateStanding(tx, match.home_team_id, match.event_id, match.season_id, {
        scored: homeScore, conceded: awayScore,
        won: !isDraw && winnerId === match.home_team_id,
        lost: !isDraw && winnerId !== match.home_team_id,
        drawn: isDraw,
      });
    }
    if (match.away_team_id) {
      await updateStanding(tx, match.away_team_id, match.event_id, match.season_id, {
        scored: awayScore, conceded: homeScore,
        won: !isDraw && winnerId === match.away_team_id,
        lost: !isDraw && winnerId !== match.away_team_id,
        drawn: isDraw,
      });
    }
  }

  // Playoff advancement logic
  if (winnerId && (match.stage === "semifinal" || match.stage === "quarterfinal")) {
    const loserId = match.home_team_id === winnerId ? match.away_team_id : match.home_team_id;
    await advancePlayoff(tx, match, winnerId, loserId);
  }

  return {
    step: "record_result",
    created: 1,
    skipped: 0,
    message: "Result recorded" + (match.stage !== "group" ? " and bracket updated" : " and standings updated"),
  };
}

// ─── ADVANCE PLAYOFF ───────────────────────────────────────────
async function advancePlayoff(tx: any, match: any, winnerId: string, loserId: string) {
  const eventId = match.event_id;
  const seasonId = match.season_id;

  if (match.stage === "semifinal") {
    // Get all semifinal matches for this event
    const semis = await tx`
      SELECT id, winner_team_id FROM matches
      WHERE event_id = ${eventId} AND season_id = ${seasonId} AND stage = 'semifinal'
      ORDER BY created_at ASC
    `;

    // Find the final and third_place matches
    const [finalMatch] = await tx`
      SELECT id, home_team_id, away_team_id FROM matches
      WHERE event_id = ${eventId} AND season_id = ${seasonId} AND stage = 'final'
      LIMIT 1
    `;
    const [thirdMatch] = await tx`
      SELECT id, home_team_id, away_team_id FROM matches
      WHERE event_id = ${eventId} AND season_id = ${seasonId} AND stage = 'third_place'
      LIMIT 1
    `;

    if (finalMatch) {
      // Determine which slot (home/away) to fill based on which semi this is
      const semIdx = semis.findIndex((s: any) => s.id === match.id);
      if (semIdx === 0) {
        await tx`UPDATE matches SET home_team_id = ${winnerId} WHERE id = ${finalMatch.id}`;
      } else {
        await tx`UPDATE matches SET away_team_id = ${winnerId} WHERE id = ${finalMatch.id}`;
      }
    }

    if (thirdMatch) {
      const semIdx = semis.findIndex((s: any) => s.id === match.id);
      if (semIdx === 0) {
        await tx`UPDATE matches SET home_team_id = ${loserId} WHERE id = ${thirdMatch.id}`;
      } else {
        await tx`UPDATE matches SET away_team_id = ${loserId} WHERE id = ${thirdMatch.id}`;
      }
    }
  }

  if (match.stage === "quarterfinal") {
    // Get all QF matches for this event
    const qfs = await tx`
      SELECT id, winner_team_id FROM matches
      WHERE event_id = ${eventId} AND season_id = ${seasonId} AND stage = 'quarterfinal'
      ORDER BY created_at ASC
    `;

    const semis = await tx`
      SELECT id FROM matches
      WHERE event_id = ${eventId} AND season_id = ${seasonId} AND stage = 'semifinal'
      ORDER BY created_at ASC
    `;

    const qfIdx = qfs.findIndex((q: any) => q.id === match.id);
    // QF0,QF1 → SF0; QF2,QF3 → SF1
    const sfIdx = Math.floor(qfIdx / 2);
    const slot = qfIdx % 2 === 0 ? "home_team_id" : "away_team_id";

    if (semis[sfIdx]) {
      if (slot === "home_team_id") {
        await tx`UPDATE matches SET home_team_id = ${winnerId} WHERE id = ${semis[sfIdx].id}`;
      } else {
        await tx`UPDATE matches SET away_team_id = ${winnerId} WHERE id = ${semis[sfIdx].id}`;
      }
    }
  }
}

async function updateStanding(
  tx: any,
  teamId: string,
  eventId: string,
  seasonId: string,
  result: { scored: number; conceded: number; won: boolean; lost: boolean; drawn: boolean }
) {
  const [standing] = await tx`
    SELECT * FROM team_standings
    WHERE team_id = ${teamId} AND event_id = ${eventId} AND season_id = ${seasonId}
  `;
  if (!standing) return;

  const played = (standing.played || 0) + 1;
  const won = (standing.won || 0) + (result.won ? 1 : 0);
  const lost = (standing.lost || 0) + (result.lost ? 1 : 0);
  const drawn = (standing.drawn || 0) + (result.drawn ? 1 : 0);
  const goalsFor = (standing.goals_for || 0) + result.scored;
  const goalsAgainst = (standing.goals_against || 0) + result.conceded;
  const goalDiff = goalsFor - goalsAgainst;
  const pts = (standing.points || 0) + (result.won ? 3 : result.drawn ? 1 : 0);

  await tx`
    UPDATE team_standings
    SET played = ${played}, won = ${won}, lost = ${lost}, drawn = ${drawn},
        goals_for = ${goalsFor}, goals_against = ${goalsAgainst},
        goal_diff = ${goalDiff}, points = ${pts}
    WHERE id = ${standing.id}
  `;
}

// ─── COMPUTE STANDINGS / POINTS (with bracket-based placement) ──
async function computeStandings(tx: any, seasonId: string) {
  const events = await tx`
    SELECT id, name, is_team_event, points_1st, points_2nd, points_3rd, points_4th, participation_points
    FROM events WHERE season_id = ${seasonId}
  `;
  if (!events.length) throw new Error("No events found");

  let pointsCreated = 0;
  let eventsSkipped = 0;

  for (const event of events) {
    if (!event.is_team_event) continue;

    // Idempotency: skip if placement points already awarded
    const existingPts = await tx`
      SELECT id FROM point_transactions
      WHERE event_id = ${event.id} AND season_id = ${seasonId} AND source = 'placement'
      LIMIT 1
    `;
    if (existingPts.length > 0) { eventsSkipped++; continue; }

    const placementPoints = [
      event.points_1st || 0,
      event.points_2nd || 0,
      event.points_3rd || 0,
      event.points_4th || 0,
    ];

    // Check if there are playoff matches (final / third_place)
    const finalMatch = await tx`
      SELECT id, winner_team_id, home_team_id, away_team_id FROM matches
      WHERE event_id = ${event.id} AND season_id = ${seasonId} AND stage = 'final'
        AND winner_team_id IS NOT NULL
      LIMIT 1
    `;
    const thirdPlaceMatch = await tx`
      SELECT id, winner_team_id, home_team_id, away_team_id FROM matches
      WHERE event_id = ${event.id} AND season_id = ${seasonId} AND stage = 'third_place'
        AND winner_team_id IS NOT NULL
      LIMIT 1
    `;

    const txns: any[] = [];

    if (finalMatch.length > 0) {
      // Bracket-based placement
      const fm = finalMatch[0];
      const champion = fm.winner_team_id;
      const runnerUp = fm.home_team_id === champion ? fm.away_team_id : fm.home_team_id;

      // Get house_id for each team
      const placedTeams = await tx`
        SELECT id, house_id FROM teams WHERE id = ANY(${[champion, runnerUp].filter(Boolean)})
      `;
      const teamHouse: Record<string, string> = {};
      for (const t of placedTeams) teamHouse[t.id] = t.house_id;

      // 1st place
      if (champion && teamHouse[champion] && placementPoints[0] > 0) {
        txns.push({
          house_id: teamHouse[champion], season_id: seasonId, event_id: event.id,
          points: placementPoints[0], source: "placement",
          description: `${event.name} - 1st place (Champion)`,
        });
      }
      // 2nd place
      if (runnerUp && teamHouse[runnerUp] && placementPoints[1] > 0) {
        txns.push({
          house_id: teamHouse[runnerUp], season_id: seasonId, event_id: event.id,
          points: placementPoints[1], source: "placement",
          description: `${event.name} - 2nd place`,
        });
      }

      // 3rd / 4th from third_place match
      if (thirdPlaceMatch.length > 0) {
        const tp = thirdPlaceMatch[0];
        const third = tp.winner_team_id;
        const fourth = tp.home_team_id === third ? tp.away_team_id : tp.home_team_id;

        const moreTeams = await tx`
          SELECT id, house_id FROM teams WHERE id = ANY(${[third, fourth].filter(Boolean)})
        `;
        for (const t of moreTeams) teamHouse[t.id] = t.house_id;

        if (third && teamHouse[third] && placementPoints[2] > 0) {
          txns.push({
            house_id: teamHouse[third], season_id: seasonId, event_id: event.id,
            points: placementPoints[2], source: "placement",
            description: `${event.name} - 3rd place`,
          });
        }
        if (fourth && teamHouse[fourth] && placementPoints[3] > 0) {
          txns.push({
            house_id: teamHouse[fourth], season_id: seasonId, event_id: event.id,
            points: placementPoints[3], source: "placement",
            description: `${event.name} - 4th place`,
          });
        }
      }
    } else {
      // Fallback: group standings-based placement (no playoffs or playoffs incomplete)
      const standings = await tx`
        SELECT ts.*, t.house_id
        FROM team_standings ts
        JOIN teams t ON t.id = ts.team_id
        WHERE ts.event_id = ${event.id} AND ts.season_id = ${seasonId}
        ORDER BY ts.points DESC, ts.goal_diff DESC, ts.goals_for DESC
      `;
      if (!standings.length) continue;

      standings.forEach((s: any, idx: number) => {
        if (!s.house_id) return;
        if (idx < 4 && placementPoints[idx] > 0) {
          txns.push({
            house_id: s.house_id, season_id: seasonId, event_id: event.id,
            points: placementPoints[idx], source: "placement",
            description: `${event.name} - ${idx + 1}${["st", "nd", "rd", "th"][idx]} place`,
          });
        }
      });
    }

    // Participation points for all teams
    const allTeams = await tx`
      SELECT t.house_id FROM teams t WHERE t.event_id = ${event.id} AND t.house_id IS NOT NULL
    `;
    if (event.participation_points && event.participation_points > 0) {
      for (const t of allTeams) {
        txns.push({
          house_id: t.house_id, season_id: seasonId, event_id: event.id,
          points: event.participation_points, source: "participation",
          description: `${event.name} - Participation`,
        });
      }
    }

    if (txns.length > 0) {
      await tx`
        INSERT INTO point_transactions ${tx(txns, "house_id", "season_id", "event_id", "points", "source", "description")}
      `;
      pointsCreated += txns.length;
    }
  }

  return {
    step: "compute_standings",
    created: pointsCreated,
    skipped: eventsSkipped,
    message: `Created ${pointsCreated} point transactions (${eventsSkipped} events skipped)`,
  };
}
