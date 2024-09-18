import { Router } from "express";
import { authenticate } from "../../controllers/user.controller.js";

const router = Router();

router.route("/authenticate").post(authenticate);

export default router;
