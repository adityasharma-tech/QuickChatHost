const { Router } = require("express");
const { sendOtp, authenticate } = require("../../controllers/user.controller.js");

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/authenticate", authenticate);

export default router