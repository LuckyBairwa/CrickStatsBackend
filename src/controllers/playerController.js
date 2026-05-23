import Player from "../models/Player.js";

import Match from "../models/Match.js";

// 😎 Add Player
export const addPlayer = async (req, res) => {
  try {
    const player = await Player.create(req.body);

    res.status(201).json({
      success: true,
      player,
    });
  } catch (error) {
    console.log("ADD PLAYER ERROR 😭", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 😎 Get All Players
export const getPlayers = async (req, res) => {
  try {
    const players = await Player.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      players,
    });
  } catch (error) {
    console.log("GET PLAYERS ERROR 😭", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 😎 Get Single Player
export const getSinglePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    res.status(200).json({
      success: true,
      player,
    });
  } catch (error) {
    console.log("GET SINGLE PLAYER ERROR 😭", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 😎 Update Player
export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPlayer = await Player.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedPlayer) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    res.status(200).json({
      success: true,
      player: updatedPlayer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 😎 Delete Player
export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Player deleted successfully",
    });
  } catch (error) {
    console.log("DELETE PLAYER ERROR 😭", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getTopPerformers = async (req, res) => {
  try {
    // 😎 Highest Runs
    const topRuns = await Player.findOne().sort({
      runs: -1,
    });

    // 😎 Highest Wickets
    const topWickets = await Player.findOne().sort({
      wickets: -1,
    });

    // 😎 Highest Sixes
    const topSixes = await Player.findOne().sort({
      sixes: -1,
    });

    // 😎 Highest Fours
    const topFours = await Player.findOne().sort({
      fours: -1,
    });

    res.status(200).json({
      success: true,

      performers: [
        {
          title: "Top Scorer",

          player: topRuns?.name || "N/A",

          value: `${topRuns?.runs || 0} Runs`,

          icon: "cricket",
        },

        {
          title: "Top Bowler",

          player: topWickets?.name || "N/A",

          value: `${topWickets?.wickets || 0} Wickets`,

          icon: "target",
        },

        {
          title: "Most Sixes",

          player: topSixes?.name || "N/A",

          value: `${topSixes?.sixes || 0} Sixes`,

          icon: "rocket-launch",
        },

        {
          title: "Most Fours",

          player: topFours?.name || "N/A",

          value: `${topFours?.fours || 0} Fours`,

          icon: "lightning-bolt",
        },
      ],
    });
  } catch (error) {
    console.log("TOP PERFORMERS ERROR 😭", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const players = await Player.find();

    const totalPlayers = players.length;

    const totalRuns = players.reduce((acc, curr) => acc + (curr.runs || 0), 0);

    const totalWickets = players.reduce(
      (acc, curr) => acc + (curr.wickets || 0),
      0,
    );

    const totalMatches = await Match.countDocuments();

    res.status(200).json({
      success: true,

      stats: {
        totalPlayers,
        totalRuns,
        totalWickets,
        totalMatches,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
