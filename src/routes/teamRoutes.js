import express from 'express';

import {
  createTeam,
  getTeams,
  getSingleTeam,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
} from '../controllers/teamController.js';

const router = express.Router();


// ✅ Create Team
router.post('/', createTeam);


// ✅ Get All Teams
router.get('/', getTeams);


// ✅ Get Single Team
router.get('/:id', getSingleTeam);


// ✅ Update Team
router.put('/:id', updateTeam);


// ✅ Delete Team
router.delete('/:id', deleteTeam);


// ✅ Add Player To Team
router.put(
  '/:id/add-player',
  addPlayerToTeam,
);


export default router;