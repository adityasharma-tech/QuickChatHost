import { Router } from "express";
import { saveContacts } from "../../controllers/contacts.controller.js";

const router = Router();

router.route("/").post(saveContacts);

export default router;
