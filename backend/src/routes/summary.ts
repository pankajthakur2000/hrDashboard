import { Router } from "express";
import { todayDateStringUtc } from "../lib/dates.js";
import { getRepo } from "../db/repo.js";

export const summaryRouter = Router();

summaryRouter.get("/", async (_req, res) => {
  const today = todayDateStringUtc();

  const repo = getRepo();
  const { employeeCount, presentToday, absentToday } = await repo.countSummary({ today });

  res.json({
    data: {
      today,
      employeeCount,
      presentToday,
      absentToday
    }
  });
});


