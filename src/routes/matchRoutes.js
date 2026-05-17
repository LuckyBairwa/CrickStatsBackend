import express from 'express';

import {
  createMatch,
  getMatches,
  getSingleMatch,
  tossMatch,
  startMatch,
  addBall,
} from '../controllers/matchController.js';

const router = express.Router();


// ✅ Create Match
router.post('/', createMatch);


// ✅ Get Matches
router.get('/', getMatches);


// ✅ Get Single Match
router.get('/:id', getSingleMatch);


// ✅ Toss Match
router.put('/:id/toss', tossMatch);


// ✅ Start Match
router.put('/:id/start', startMatch);


// ✅ Add Ball
router.put('/:id/add-ball', addBall);

export default router;