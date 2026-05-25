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
      min: [0, 'Runs cannot be negative'],
    },

    ballsPlayed: {
      type: Number,
      default: 0,
      min: [0, 'Balls played cannot be negative'],
    },

    strikeRate: {
      type: Number,
      default: 0,
      min: [0, 'Strike rate cannot be negative'],
    },

    fours: {
      type: Number,
      default: 0,
       min: [0, 'Fours cannot be negative'],
    },

    sixes: {
      type: Number,
      default: 0,
      min: [0, 'Sixes cannot be negative'],
    },

    thirties: {
      type: Number,
      default: 0,
      min: [0, 'Thirties cannot be negative'],
    },

    forties: {
      type: Number,
      default: 0,
      min: [0, 'Forties cannot be negative'],
    },

    // Bowling Stats 🎯
    wickets: {
      type: Number,
      default: 0,
      min: [0, 'Wickets cannot be negative'],
    },

    dotBalls: {
      type: Number,
      default: 0,
      min: [0, 'Dot balls cannot be negative'],
    },

    oversBowled: {
      type: Number,
      default: 0,
      min: [0, 'Overs bowled cannot be negative'],
    },

    economy: {
      type: Number,
      default: 0,
      min: [0, 'Economy cannot be negative'],
    },

    runsGiven: {
      type: Number,
      default: 0,
      min: [0, 'Runs given cannot be negative'],
    },

    // Fielding 😎
    catches: {
      type: Number,
      default: 0,
      min: [0, 'Catches cannot be negative'],
    },

    // Match Stats
    matchesPlayed: {
      type: Number,
      default: 0,
      min: [0, 'Matches played cannot be negative'],
    },

    matchesWon: {
      type: Number,
      default: 0,
      min: [0, 'Matches won cannot be negative'],
    },
  },

  {
    timestamps: true,
  },
);

const Player = mongoose.model("Player", playerSchema);

export default Player;
