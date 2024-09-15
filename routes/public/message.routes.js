import { Router } from 'express'
import { sendMessageViaNotification } from '../../controllers/message..js';

const router = Router();

router.route('/new', sendMessageViaNotification)

export default router;