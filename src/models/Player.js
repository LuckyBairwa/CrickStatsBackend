import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nickName: {
      type: String,
      default: "",
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
      default: "Male",
    },

    jerseyNumber: {
      type: Number,
      default: 0,
      unique: true,
    },

    role: {
      type: String,
      default: "Player",
    },

    team: {
      type: String,
      default: "",
    },

    batsmanType: {
      type: String,
      enum: ["Right-handed", "Left-handed"],
      default: "Right-handed",
    },
    bowlerType: {
      type: String,
      enum: ["Right-arm", "Left-arm"],
      default: "Right-arm",
    },
    bowlingStyle: {
      type: String,
      enum: ["Fast", "Medium", "Spin"],
      default: "Medium",
    },

    // Batting Stats 😎
    runs: {
      type: Number,
      default: 0,
    },

    ballsPlayed: {
      type: Number,
      default: 0,
    },

    strikeRate: {
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

    thirties: {
      type: Number,
      default: 0,
    },

    forties: {
      type: Number,
      default: 0,
    },

    // Bowling Stats 🎯
    wickets: {
      type: Number,
      default: 0,
    },

    dotBalls: {
      type: Number,
      default: 0,
    },

    oversBowled: {
      type: Number,
      default: 0,
    },

    economy: {
      type: Number,
      default: 0,
    },

    runsGiven: {
      type: Number,
      default: 0,
    },

    // Fielding 😎
    catches: {
      type: Number,
      default: 0,
    },

    // Match Stats
    matchesPlayed: {
      type: Number,
      default: 0,
    },

    matchesWon: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  },
);

const Player = mongoose.model("Player", playerSchema);

export default Player;
