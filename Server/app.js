const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Create express application
const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

module.exports = app;
