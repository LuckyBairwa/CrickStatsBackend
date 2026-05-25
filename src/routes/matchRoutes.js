import express from 'express';

import {
  createMatch,
  getMatches,
  getSingleMatch,
  tossMatch,
  startMatch,
  updateMatch,
  addBall,
  deleteMatch,
} from '../controllers/matchController.js';

const router = express.Router();


// ✅ Create Match
router.post('/', createMatch);

// ✅ Get Matches
router.get('/', getMatches);

// ✅ Get Single Match
router.get('/:id', getSingleMatch);

// ✅ Update Match
router.put('/:id/save', updateMatch);

// ✅ Delete Match
router.delete('/:id', deleteMatch);

// ✅ Toss Match
router.put('/:id/toss', tossMatch);

// ✅ Start Match
router.put('/:id/start', startMatch);

// ✅ Add Ball
router.put('/:id/add-ball', addBall);

export default router;