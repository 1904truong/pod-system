const express = require('express');
const router = express.Router();
const { getTasks } = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getTasks);

module.exports = router;
