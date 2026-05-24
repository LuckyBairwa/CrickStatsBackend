import mongoose from "mongoose";

// 🏏 Batter Schema
const batterSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },

  runs: {
    type: Number,
    default: 0,
  },

  balls: {
    type: Number,
    default: 0,
  },

  fours: {
    type: Number,
    default: 0,
  },

  sixes: {
    type: Number,
    default: 0,
  },

  strikeRate: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: [
      "Not Out",
      "Bowled",
      "Caught",
      "Run Out",
      "LBW",
      "Hit Wicket",
      "Stumped",
      "Resting",
    ],

    default: "Not Out",
  },

  isResting: {
    type: Boolean,
    default: false,
  },
});

// 🎯 Bowler Schema
const bowlerSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },

  overs: {
    type: Number,
    default: 0,
  },

  maidens: {
    type: Number,
    default: 0,
  },

  runsGiven: {
    type: Number,
    default: 0,
  },

  wickets: {
    type: Number,
    default: 0,
  },

  economy: {
    type: Number,
    default: 0,
  },

  dotBalls: {
    type: Number,
    default: 0,
  },
});

// ⚡ Ball By Ball Schema
const overBallSchema = new mongoose.Schema({
  over: Number,

  ball: Number,

  runs: Number,
  totalRuns: Number,

  extraType: {
    type: String,
    enum: ["NB", "WB", "LB", "B", ""],
    default: "",
  },

  wicket: {
    type: Boolean,
    default: false,
  },

  wicketType: {
    type: String,
    enum: ["Bowled", "Caught", "Run Out", "LBW", "Hit Wicket", "Stumped"],
    default: "",
  },
});

// 🤝 Partnership Schema
const partnershipSchema = new mongoose.Schema({
  batter1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },

  batter2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },

  runs: {
    type: Number,
    default: 0,
  },

  balls: {
    type: Number,
    default: 0,
  },
});

// 🏏 Innings Schema
const inningsSchema = new mongoose.Schema({
  legalBalls: {
    type: Number,
    default: 0,
  },

  battingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },

  bowlingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  status: {
    type: String,
    enum: ["Not Started", "Live", "Completed"],
    default: "Not Started",
  },

  totalRuns: {
    type: Number,
    default: 0,
  },

  wickets: {
    type: Number,
    default: 0,
  },

  oversPlayed: {
    type: Number,
    default: 0,
  },

  extras: {
    type: Number,
    default: 0,
  },

  batters: [batterSchema],

  bowlers: [bowlerSchema],

  overHistory: [overBallSchema],
});

// 🏆 Match Schema
const matchSchema = new mongoose.Schema(
  {
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    overs: {
      type: Number,
      default: 5,
    },

    tossWinner: {
      type: String,
      default: "",
    },

    tossDecision: {
      type: String,
      enum: ["Bat", "Bowl"],
      default: "Bat",
    },

    status: {
      type: String,
      enum: ["Not Started", "Live", "Completed"],
      default: "Not Started",
    },

    target: {
      type: Number,
      default: 0,
    },

    innings1: inningsSchema,

    innings2: inningsSchema,

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    result: {
      type: String,
      default: "",
    },

    // 📅 Match Date
    matchDate: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  },
);

const Match = mongoose.model("Match", matchSchema);

export default Match;
