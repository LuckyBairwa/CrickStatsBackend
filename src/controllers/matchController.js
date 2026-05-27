import Match from "../models/Match.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";

import { addBallLogic } from "../services/scoreService.js";

// ✅ Create Match
export const createMatch = async (req, res) => {
  try {
    const { teamA, teamB, overs, matchDate, matchTime, venue } = req.body;

    // Validation 😎
    if (!teamA || !teamB) {
      return res.status(400).json({
        success: false,
        message: "Both teams are required",
      });
    }

    // Prevent same teams
    if (teamA === teamB) {
      return res.status(400).json({
        success: false,
        message: "Teams cannot be same",
      });
    }

    // Check Team Exists
    const firstTeam = await Team.findById(teamA);

    const secondTeam = await Team.findById(teamB);

    if (!firstTeam || !secondTeam) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Create Match 😎
    const match = await Match.create({
      teamA,
      teamB,
      overs,
      matchDate: matchDate || Date.now(),
      matchTime: matchTime || "",
      venue: venue || "Home Ground",
      status: "Not Started",
    });

    const populatedMatch = await Match.findById(match._id)
      .populate("teamA")
      .populate("teamB");

    res.status(201).json({
      success: true,
      message: "🏏 Match Created Successfully",
      match,
    });
  } catch (error) {
    console.log("❌ CREATE MATCH ERROR:", error.message);
    console.log("❌ FULL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Delete Match + Undo Player Stats
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // ✅ Sirf completed/live matches ke liye stats undo karo
    if (match.status === "Completed" || match.status === "Live") {
      const allPlayers = [];

      // ─── Helper: player ko list mein find ya add karo ───────────────
      const getOrAdd = (playerId) => {
        const existing = allPlayers.find(
          (p) => p._id.toString() === playerId.toString(),
        );
        if (existing) return existing;

        const newEntry = {
          _id: playerId,
          runs: 0,
          fours: 0,
          sixes: 0,
          ballsPlayed: 0,
          thirties: 0,
          forties: 0,
          wickets: 0,
          dotBalls: 0,
          runsGiven: 0,
          oversBowled: 0,
          catches: 0,
        };
        allPlayers.push(newEntry);
        return newEntry;
      };

      // ─── Innings loop (1 aur 2 dono) ────────────────────────────────
      [match.innings1, match.innings2].forEach((innings) => {
        if (!innings) return;

        // Batters — subtract karo
        innings.batters?.forEach((b) => {
          const p = getOrAdd(b.player);
          p.runs -= b.runs || 0;
          p.fours -= b.fours || 0;
          p.sixes -= b.sixes || 0;
          p.ballsPlayed -= b.balls || 0;
          p.thirties -= b.thirties || 0;
          p.forties -= b.forties || 0;
        });

        // Bowlers — subtract karo
        innings.bowlers?.forEach((b) => {
          const p = getOrAdd(b.player);
          p.wickets -= b.wickets || 0;
          p.dotBalls -= b.dotBalls || 0;
          p.runsGiven -= b.runsGiven || 0;
          p.oversBowled -= b.overs || 0;
        });

        // Fielders (catches) — subtract karo
        innings.fielders?.forEach((f) => {
          const p = getOrAdd(f.player);
          p.catches -= f.catches || 0;
        });
      });

      // ─── DB update ───────────────────────────────────────────────────
      const updatePromises = allPlayers.map(async (p) => {
        const cur = await Player.findById(p._id);
        if (!cur) return;

        // Safe values — kabhi negative nahi jaayenge
        const newRuns = Math.max(0, (cur.runs || 0) + p.runs);
        const newBalls = Math.max(0, (cur.ballsPlayed || 0) + p.ballsPlayed);
        const newFours = Math.max(0, (cur.fours || 0) + p.fours);
        const newSixes = Math.max(0, (cur.sixes || 0) + p.sixes);
        const newThirties = Math.max(0, (cur.thirties || 0) + p.thirties);
        const newForties = Math.max(0, (cur.forties || 0) + p.forties);
        const newWickets = Math.max(0, (cur.wickets || 0) + p.wickets);
        const newDotBalls = Math.max(0, (cur.dotBalls || 0) + p.dotBalls);
        const newRunsGiven = Math.max(0, (cur.runsGiven || 0) + p.runsGiven);
        const newOversBowled = Math.max(
          0,
          (cur.oversBowled || 0) + p.oversBowled,
        );
        const newCatches = Math.max(0, (cur.catches || 0) + p.catches);
        const newMatchesPlayed = Math.max(0, (cur.matchesPlayed || 0) - 1);

        // Strike rate
        const newStrikeRate =
          newBalls > 0
            ? parseFloat(((newRuns / newBalls) * 100).toFixed(2))
            : 0;

        // Economy — balls ko proper overs mein convert karo
        const completedOvers = Math.floor(newOversBowled / 6);
        const remainingBalls = newOversBowled % 6;
        const oversInDecimal = completedOvers + remainingBalls / 6;

        const newEconomy =
          newOversBowled > 0
            ? parseFloat((newRunsGiven / newOversBowled).toFixed(2))
            : 0;

        // ✅ $set use karo — $inc bilkul nahi (double count hoga)
        return Player.findByIdAndUpdate(p._id, {
          $set: {
            runs: newRuns,
            ballsPlayed: newBalls,
            fours: newFours,
            sixes: newSixes,
            thirties: newThirties,
            forties: newForties,
            wickets: newWickets,
            dotBalls: newDotBalls,
            runsGiven: newRunsGiven,
            oversBowled: newOversBowled,
            catches: newCatches,
            matchesPlayed: newMatchesPlayed,
            strikeRate: newStrikeRate,
            economy: newEconomy,
          },
        });
      });

      await Promise.all(updatePromises);
    }

    await Match.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "✅ Match deleted and player stats undone successfully",
    });
  } catch (error) {
    console.log("❌ DELETE MATCH ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Update Match (Final Save)
export const updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Match Saved Successfully",
      match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get All Matches
export const getMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("teamA")
      .populate("teamB")
      .populate("winner")
      .populate("innings1.battingTeam")
      .populate("innings1.bowlingTeam")
      .populate("innings2.battingTeam")
      .populate("innings2.bowlingTeam")
      .sort({ createdAt: -1 })
      .lean();

    const playerIdSet = new Set();

    matches.forEach((match) => {
      match.innings1?.batters?.forEach(
        (b) => b.player && playerIdSet.add(String(b.player)),
      );
      match.innings1?.bowlers?.forEach(
        (b) => b.player && playerIdSet.add(String(b.player)),
      );
      match.innings2?.batters?.forEach(
        (b) => b.player && playerIdSet.add(String(b.player)),
      );
      match.innings2?.bowlers?.forEach(
        (b) => b.player && playerIdSet.add(String(b.player)),
      );
    });

    const players = await Player.find({
      _id: { $in: Array.from(playerIdSet) },
    })
      .select("name role")
      .lean();

    const playerMap = {};
    players.forEach((p) => {
      playerMap[String(p._id)] = p;
    });

    const populatedMatches = matches.map((match) => ({
      ...match,
      innings1: match.innings1
        ? {
            ...match.innings1,
            batters:
              match.innings1.batters?.map((b) => ({
                ...b,
                player: playerMap[String(b.player)] || b.player,
              })) || [],
            bowlers:
              match.innings1.bowlers?.map((b) => ({
                ...b,
                player: playerMap[String(b.player)] || b.player,
              })) || [],
          }
        : null,
      innings2: match.innings2
        ? {
            ...match.innings2,
            batters:
              match.innings2.batters?.map((b) => ({
                ...b,
                player: playerMap[String(b.player)] || b.player,
              })) || [],
            bowlers:
              match.innings2.bowlers?.map((b) => ({
                ...b,
                player: playerMap[String(b.player)] || b.player,
              })) || [],
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      count: populatedMatches.length,
      matches: populatedMatches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get Single Match
export const getSingleMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("teamA")
      .populate("teamB")
      .populate("innings1.currentStriker")
      .populate("innings1.currentNonStriker")
      .populate("innings1.currentBowler")
      .populate("innings2.currentStriker")
      .populate("innings2.currentNonStriker")
      .populate("innings2.currentBowler")
      .populate({ path: "innings1.batters.player", select: "name role" })
      .populate({ path: "innings1.bowlers.player", select: "name role" })
      .populate({ path: "innings2.batters.player", select: "name role" })
      .populate({ path: "innings2.bowlers.player", select: "name role" });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.status(200).json({
      success: true,
      match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Toss Match
export const tossMatch = async (req, res) => {
  try {
    const { tossWinner, tossDecision } = req.body;

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    match.tossWinner = tossWinner;

    match.tossDecision = tossDecision;

    await match.save();

    res.status(200).json({
      success: true,
      message: "🪙 Toss Updated",
      match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Start Match
export const startMatch = async (req, res) => {
  try {
    const { striker, nonStriker, bowler } = req.body;

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // Determine batting team 😎
    let battingTeam;
    let bowlingTeam;

    if (match.tossDecision === "Bat") {
      battingTeam = match.tossWinner;
    } else {
      battingTeam =
        match.tossWinner === String(match.teamA)
          ? String(match.teamB)
          : String(match.teamA);
    }

    bowlingTeam =
      battingTeam === String(match.teamA)
        ? String(match.teamB)
        : String(match.teamA);

    // Setup innings 😎
    match.innings1 = {
      battingTeam,
      bowlingTeam,

      currentStriker: striker,

      currentNonStriker: nonStriker || null,

      currentBowler: bowler,

      totalRuns: 0,

      wickets: 0,

      oversPlayed: 0,

      extras: 0,
    };

    match.status = "Live";

    await match.save();

    res.status(200).json({
      success: true,
      message: "🔥 Match Started Successfully",
      match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Add Ball
export const addBall = async (req, res) => {
  try {
    const { runs, extraType, isWicket, wicketType } = req.body;

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    const innings =
      match.currentInnings === 1 ? match.innings1 : match.innings2;

    // Current Players 😎
    const striker = await Player.findById(innings.currentStriker);

    const nonStriker = innings.currentNonStriker
      ? await Player.findById(innings.currentNonStriker)
      : null;

    const bowler = await Player.findById(innings.currentBowler);

    // Run scoring logic 😎
    const result = await addBallLogic({
      innings,
      striker,
      nonStriker,
      bowler,
      runs,
      isWicket,
      wicketType,
      extraType,
    });

    // Rotate Strike 😎
    if (result.rotateStrike && nonStriker) {
      const temp = innings.currentStriker;

      innings.currentStriker = innings.currentNonStriker;

      innings.currentNonStriker = temp;
    }

    // Save ball history 😎
    innings.overHistory.push({
      over: Math.floor(legalBalls / 6) + "." + (legalBalls % 6),

      ball: (innings.legalBalls % 6) + 1,

      batsman: striker._id,

      bowler: bowler._id,

      runs,

      extraType,

      wicket: isWicket,

      wicketType,
    });

    // Save 😎
    await striker.save();

    await bowler.save();

    await match.save();

    res.status(200).json({
      success: true,
      message: "🏏 Ball Added",
      match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
