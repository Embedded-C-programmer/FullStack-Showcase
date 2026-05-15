const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/sessions', chatController.getSessions);
router.post('/sessions', chatController.createSession);
router.get('/sessions/:id', chatController.getSession);
router.post('/sessions/:id/messages', chatController.sendMessage);
router.delete('/sessions/:id', chatController.deleteSession);
router.patch('/sessions/:id/archive', chatController.archiveSession);

module.exports = router;
