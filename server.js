const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve all static files from the current directory
app.use(express.static(__dirname));

// Direct catch-all route to serve index.html for root requests
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Proxy endpoint for live flight data
app.get('/api/flights', async (req, res) => {
  const { lat, lon, dist } = req.query;
  try {
    const response = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Backend fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch ADSB data", details: err.message });
  }
});

// Proxy endpoint for route lookup
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

    if (!response.ok) {
      // Return an empty array smoothly instead of throwing a 500 server error
      return res.json([]); 
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Backend route fetch error:", err.message);
    res.json([]); // Graceful fallback
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
