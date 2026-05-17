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
      matchDate,
      matchTime,
      venue,
      status: "Upcoming",
    });

    res.status(201).json({
      success: true,
      message: "🏏 Match Created Successfully",
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
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
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
      .populate("innings2.currentBowler");

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
export const addBall = async (
  req,
  res,
) => {
  try {

    const {
      runs,
      extraType,
      isWicket,
      wicketType,
    } = req.body;

    const match = await Match.findById(
      req.params.id,
    );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }

    const innings =
      match.currentInnings === 1
        ? match.innings1
        : match.innings2;

    // Current Players 😎
    const striker =
      await Player.findById(
        innings.currentStriker,
      );

    const nonStriker =
      innings.currentNonStriker
        ? await Player.findById(
            innings.currentNonStriker,
          )
        : null;

    const bowler =
      await Player.findById(
        innings.currentBowler,
      );

    // Run scoring logic 😎
    const result =
      await addBallLogic({
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
    if (
      result.rotateStrike &&
      nonStriker
    ) {

      const temp =
        innings.currentStriker;

      innings.currentStriker =
        innings.currentNonStriker;

      innings.currentNonStriker =
        temp;
    }

    // Save ball history 😎
    innings.overHistory.push({
      over:
        Math.floor(
          innings.oversPlayed,
        ) + 1,

      ball:
        (
          innings.overHistory.length %
          6
        ) + 1,

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
      message: '🏏 Ball Added',
      match,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};