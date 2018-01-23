import express from 'express';
const router = express.Router();

// Controller Imports
const userControllers = require('../controllers/users');

router.get('/login', userControllers.login);

export default router;