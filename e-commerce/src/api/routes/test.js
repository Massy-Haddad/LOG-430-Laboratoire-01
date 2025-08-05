import express from 'express';

const router = express.Router();

// Simple test route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'e-commerce' });
});

export default router;
