import { Router } from "express";
import healthRouter from "./health.js";

const router: Router = Router();

router.use(healthRouter);

export default router;
