import express from 'express';

import {
  addPlayer,
  getPlayers,
  getSinglePlayer,
  updatePlayer,
  deletePlayer,
  updatePlayersAfterMatch ,
} from '../controllers/playerController.js';

const router = express.Router();


// ✅ Add Player
router.post('/', addPlayer);

router.put('/update-after-match', updatePlayersAfterMatch);


// ✅ Get All Players
router.get('/', getPlayers);


// ✅ Get Single Player
router.get('/:id', getSinglePlayer);


// ✅ Update Player
router.put('/update-player/:id', updatePlayer);


// ✅ Delete Player
router.delete('/:id', deletePlayer);


export default router;