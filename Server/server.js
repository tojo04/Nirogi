


const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const routes = require('./routes');

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirogi';

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Mount application routes (single mount point)
    app.use('/api/v1', routes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();

