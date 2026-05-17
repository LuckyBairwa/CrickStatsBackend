import express from "express";

import {
  getDashboardStats,
  getTopPerformers,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", getDashboardStats);
router.get("/top-performers", getTopPerformers);

export default router;
