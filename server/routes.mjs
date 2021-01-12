import express from 'express';

const router = express.Router();

router.get('/test', (_req, res) => {
  res.json({ hi: 'hai' });
});

export default router;
