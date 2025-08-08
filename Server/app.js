const express = require('express');
const cors = require('cors');

const app = express();

// Permissive CORS for local dev: reflect request origin
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());

module.exports = app;