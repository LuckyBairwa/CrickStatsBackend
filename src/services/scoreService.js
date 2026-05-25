// services/scoreService.js

export const addBallLogic = async ({
  match,
  innings,
  striker,
  nonStriker,
  bowler,
  runs,
  isWicket,
  wicketType,
  extraType,
  nextBatter,
  battingPlayersCount,
}) => {
  // 🏏 Extra Ball
  const isExtraBall = extraType === "NB" || extraType === "WB";

  // 🏏 Total Ball Runs
  let totalBallRuns = runs;

  if (isExtraBall) {
    totalBallRuns += 1;
  }

  // 🏏 Team Runs
  innings.totalRuns += totalBallRuns;

  // 🏏 Extras
  if (extraType) {
    innings.extras += totalBallRuns;
  }

  // ===================================================
  // 😎 FIND BATTER SCORECARD
  // ===================================================

  let batterStats = innings.batters.find(
    (b) => b.player.toString() === striker._id.toString(),
  );

  // Create if missing 😎
  if (!batterStats) {
    batterStats = {
      player: striker._id,
    };

    innings.batters.push(batterStats);

    batterStats = innings.batters[innings.batters.length - 1];
  }

  // ===================================================
  // 🎯 FIND BOWLER SCORECARD
  // ===================================================

  let bowlerStats = innings.bowlers.find(
    (b) => b.player.toString() === bowler._id.toString(),
  );

  // Create if missing 😎
  if (!bowlerStats) {
    bowlerStats = {
      player: bowler._id,
    };

    innings.bowlers.push(bowlerStats);

    bowlerStats = innings.bowlers[innings.bowlers.length - 1];
  }

  // ===================================================
  // 😎 BATTER RUNS
  // ===================================================

  if (extraType !== "LB" && extraType !== "B" && extraType !== "WB") {
    striker.runs += runs;

    batterStats.runs += runs;
  }

  // ===================================================
  // 😎 LEGAL BALL
  // ===================================================
  if (!isExtraBall) {
    innings.legalBalls += 1;

    striker.ballsPlayed += 1;
    batterStats.balls += 1;

    // ✅ Ye add karo — bowler ke balls bhi yahi track honge
    bowler.oversBowled += 1;
    bowlerStats.balls = (bowlerStats.balls || 0) + 1;
  }

  // ===================================================
  // 😎 BOUNDARIES
  // ===================================================

  if (runs === 4) {
    striker.fours += 1;

    batterStats.fours += 1;
  }

  if (runs === 6) {
    striker.sixes += 1;

    batterStats.sixes += 1;
  }

  // ===================================================
  // 😎 DOT BALLS
  // ===================================================

  if (runs === 0 && !extraType) {
    striker.dotBalls += 1;

    bowler.dotBalls += 1;

    bowlerStats.dotBalls += 1;
  }

  // ===================================================
  // 😎 STRIKE RATE
  // ===================================================

  striker.strikeRate =
    striker.ballsPlayed > 0 ? (striker.runs / striker.ballsPlayed) * 100 : 0;

  batterStats.strikeRate =
    batterStats.balls > 0 ? (batterStats.runs / batterStats.balls) * 100 : 0;

  // ===================================================
  // 🎯 BOWLER RUNS
  // ===================================================

  if (extraType !== "LB" && extraType !== "B") {
    bowler.runsGiven += totalBallRuns;

    bowlerStats.runsGiven += totalBallRuns;
  }

  // ===================================================
  // 🎯 OVERS
  // ===================================================

  bowlerStats.overs = `${Math.floor((bowlerStats.balls || 0) / 6)}.${
    (bowlerStats.balls || 0) % 6
  }`;

  innings.oversPlayed = `${Math.floor(innings.legalBalls / 6)}.${
    innings.legalBalls % 6
  }`;

  // ===================================================
  // 🎯 ECONOMY
  // ===================================================

  const bBalls = bowlerStats.balls || 0;
  const bOversDecimal = Math.floor(bBalls / 6) + (bBalls % 6) / 6;

  bowlerStats.economy =
    bOversDecimal > 0
      ? parseFloat((bowlerStats.runsGiven / bOversDecimal).toFixed(2))
      : 0;

  // Player (bowler) global stats — legal ball section mein +1 ho chuka hai
  // Sirf economy recalculate karo
  const pBalls = bowler.oversBowled || 0;
  const pOversDecimal = Math.floor(pBalls / 6) + (pBalls % 6) / 6;

  bowler.economy =
    pOversDecimal > 0
      ? parseFloat((bowler.runsGiven / pOversDecimal).toFixed(2))
      : 0;

  // ===================================================
  // 🤝 PARTNERSHIP
  // ===================================================

  innings.currentPartnership.runs += totalBallRuns;

  if (!isExtraBall) {
    innings.currentPartnership.balls += 1;
  }

  // ===================================================
  // 😎 WICKET
  // ===================================================

  if (isWicket) {
    innings.wickets += 1;

    batterStats.status = wicketType;

    // Except runout 😎
    if (wicketType !== "Run Out") {
      bowler.wickets += 1;

      bowlerStats.wickets += 1;
    }

    // Save Partnership
    innings.partnerships.push({
      batter1: innings.currentPartnership.batter1,

      batter2: innings.currentPartnership.batter2,

      runs: innings.currentPartnership.runs,

      balls: innings.currentPartnership.balls,
    });

    // Reset Partnership
    innings.currentPartnership = {
      runs: 0,
      balls: 0,

      batter1: nonStriker?._id || null,

      batter2: nextBatter || null,
    };
  }

  // ===================================================
  // 😎 NEXT BATTER
  // ===================================================

  if (isWicket && nextBatter) {
    innings.currentStriker = nextBatter;
  }

  // ===================================================
  // 😎 STRIKE ROTATION
  // ===================================================

  let rotateStrike = false;

  if (!isExtraBall && nonStriker) {
    if ([1, 3, 5].includes(runs)) {
      rotateStrike = true;
    }
  }

  // ===================================================
  // 😎 OVER COMPLETE
  // ===================================================

  const overCompleted = innings.legalBalls % 6 === 0;

  // ===================================================
  // 🏏 INNINGS COMPLETE
  // ===================================================

  const inningsFinished =
    innings.legalBalls >= match.overs * 6 ||
    innings.wickets >= battingPlayersCount - 1;

  // ===================================================
  // 🏆 MATCH RESULT
  // ===================================================

  if (inningsFinished) {
    // Switch innings 😎
    if (match.currentInnings === 1) {
      match.currentInnings = 2;
    } else {
      match.status = "Completed";

      const score1 = match.innings1.totalRuns;

      const score2 = match.innings2.totalRuns;

      if (score1 > score2) {
        match.winner = match.innings1.battingTeam;

        match.result = `Won by ${score1 - score2} runs`;
      } else if (score2 > score1) {
        const wicketsRemaining = battingPlayersCount - innings.wickets - 1;

        match.winner = match.innings2.battingTeam;

        match.result = `Won by ${wicketsRemaining} wickets`;
      } else {
        match.result = "Match Draw";
      }
    }
  }

  // ===================================================
  // 😎 RETURN
  // ===================================================

  return {
    rotateStrike,
    overCompleted,
    inningsFinished,
  };
};
