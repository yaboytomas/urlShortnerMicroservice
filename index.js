require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// In-memory storage for URLs (in production, use a database)
let urlDatabase = {};
let urlCounter = 1;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL validation function
function isValidUrl(url) {
  try {
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    return urlPattern.test(url);
  } catch (e) {
    return false;
  }
}

// POST /api/shorturl - Create short URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  // Validate URL format
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }
  
  // Store URL and return response
  const shortUrl = urlCounter++;
  urlDatabase[shortUrl] = originalUrl;
  
  res.json({
    original_url: originalUrl,
    short_url: shortUrl
  });
});

// GET /api/shorturl/:short_url - Redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const originalUrl = urlDatabase[shortUrl];
  
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
