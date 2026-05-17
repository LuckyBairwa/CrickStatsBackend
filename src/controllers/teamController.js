import Team from "../models/Team.js";
import Player from "../models/Player.js";

// ✅ Create Team
export const createTeam = async (req, res) => {
  try {
    const { name, captain, players } = req.body;

    // Validation 😎
    if (!name || !captain || !players) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // Create Team
    const team = await Team.create({
      name,
      captain,
      players,
    });

    res.status(201).json({
      success: true,
      message: "🏏 Team Created Successfully",
      team,
    });
  } catch (error) {
    console.log("Create Team Error 😭", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get All Teams
export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("captain")
      .populate("players")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get Single Team
export const getSingleTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("captain")
      .populate("players");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Update Team
export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "😎 Team Updated",
      team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Delete Team
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "🗑️ Team Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Add Player To Team
export const addPlayerToTeam = async (req, res) => {
  try {
    const { playerId } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    // Prevent duplicate 😎
    if (team.players.includes(playerId)) {
      return res.status(400).json({
        success: false,
        message: "Player already exists in team",
      });
    }

    team.players.push(playerId);

    await team.save();

    res.status(200).json({
      success: true,
      message: "🏏 Player Added To Team",
      team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
