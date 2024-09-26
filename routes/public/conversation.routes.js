import { Router } from 'express'
import { fetchConversationsBatch } from '../../controllers/conversation.controller.js';

const router = Router();

router.route('/batch').post(fetchConversationsBatch)

export default router;