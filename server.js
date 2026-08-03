const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serves static HTML files and subfolders (like /images/ezy.png) automatically
app.use(express.static(__dirname));

// Route for default index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Explicit route for Bristol Radar overlay
app.get('/bristolradar', (req, res) => {
  res.sendFile(path.join(__dirname, 'bristolradar.html'));
});

// Fetch Live Flight Data
app.get('/api/flights', async (req, res) => {
  const { lat, lon, dist } = req.query;
  try {
    const response = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Backend fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch ADSB data" });
  }
});

// Proxy endpoint for Route Lookup (Graceful Fallback)
app.post('/api/routeset', async (req, res) => {
  try {
    const response = await fetch('https://api.adsb.lol/api/0/routeset', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'SSTV-Data-Tags-Overlay/1.0'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) return res.json([]);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Route error:", err.message);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
