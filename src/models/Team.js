import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },

    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],

    matchesPlayed: {
      type: Number,
      default: 0,
    },

    matchesWon: {
      type: Number,
      default: 0,
    },
    matchesLost: {
      type: Number,
      default: 0,
    },
    matchesPoints:{
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  },
);

const Team = mongoose.model(
  'Team',
  teamSchema,
);

export default Team;