import { Router } from 'express';

const router = Router();

router.post('/execute', async (req, res) => {
  try {
    const { language, version, files } = req.body;
    
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language, version, files })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;