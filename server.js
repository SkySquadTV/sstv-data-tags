const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (index.html, etc.)
app.use(express.static(path.join(__dirname)));

// Proxy endpoint for live flight data
app.get('/api/flights', async (req, res) => {
  const { lat, lon, dist } = req.query;
  try {
    const response = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Backend fetch error:", err);
    res.status(500).json({ error: "Failed to fetch ADSB data" });
  }
});

// Proxy endpoint for route lookup
app.post('/api/routeset', async (req, res) => {
  try {
    const response = await fetch('https://api.adsb.lol/api/0/routeset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Backend route fetch error:", err);
    res.status(500).json({ error: "Failed to fetch route data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
