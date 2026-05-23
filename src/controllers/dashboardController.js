import Player from "../models/Player.js";
import Match from "../models/Match.js";

export const getTopPerformers = async (req, res) => {
  try {

    const topRuns = await Player.findOne().sort({
      runs: -1,
    });

    const topWickets = await Player.findOne().sort({
      wickets: -1,
    });

    const topSixes = await Player.findOne().sort({
      sixes: -1,
    });

    const topFours = await Player.findOne().sort({
      fours: -1,
    });

    // 😎 Best Economy
    const bestEconomy = await Player.findOne().sort({
      economy: 1,
    });

    // 😎 Most Dot Balls
    const mostDotBalls = await Player.findOne().sort({
      dotBalls: -1,
    });

    res.status(200).json({
      success: true,

      performers: [
        {
          title: "Top Scorer",
          player: topRuns?.name || "N/A",
          value: `${topRuns?.runs || 0} Runs`,
          icon: "trophy-outline",
        },

        {
          title: "Top Bowler",
          player: topWickets?.name || "N/A",
          value: `${topWickets?.wickets || 0} Wickets`,
          icon: "radio-outline",
        },

        {
          title: "Most Sixes",
          player: topSixes?.name || "N/A",
          value: `${topSixes?.sixes || 0} Sixes`,
          icon: "flash-outline",
        },

        {
          title: "Most Fours",
          player: topFours?.name || "N/A",
          value: `${topFours?.fours || 0} Fours`,
          icon: "trending-up",
        },

        {
          title: "Best Economy",
          player: bestEconomy?.name || "N/A",
          value: `${bestEconomy?.economy || 0} Economy`,
          icon: "speedometer",
        },

        {
          title: "Most Dot Balls",
          player: mostDotBalls?.name || "N/A",
          value: `${mostDotBalls?.dotBalls || 0} Dot Balls`,
          icon: "remove-circle",
        },
      ],
    });
  } catch (error) {
    console.log("😭 TOP PERFORMERS ERROR", error);

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
    console.log("😭 DASHBOARD ERROR", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
