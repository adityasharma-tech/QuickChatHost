import { Router } from "express";
import { authenticate, updateUserAvatar } from "../../controllers/user.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";

const router = Router();

router.route("/authenticate").post(authenticate);

// secure routes
router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar)

export default router;
