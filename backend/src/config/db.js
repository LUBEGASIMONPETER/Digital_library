const mongoose = require('mongoose');

// Resilient MongoDB connection with retry/backoff for development.
// Returns a Promise that resolves only when Mongoose is connected.
const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI not set in environment');
    return;
  }

  const maxImmediateRetries = 5;
  const longBackoff = 30000; // 30 seconds
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryConnect = () => {
      attempt += 1;
      console.log(`MongoDB: attempting connection (attempt ${attempt})`);

      mongoose.connect(uri, options)
        .then(() => {
          console.log('MongoDB connected');
          resolve();
        })
        .catch(err => {
          console.error(`MongoDB connection error (attempt ${attempt}):`, err.message);

          if (attempt < maxImmediateRetries) {
            const backoff = 1000 * attempt; // 1s, 2s, ...
            console.log(`Retrying connection in ${backoff}ms...`);
            setTimeout(tryConnect, backoff);
            return;
          }

          console.warn(`MongoDB not reachable after ${attempt} attempts. Will keep retrying every ${longBackoff/1000}s until connected.`);

          // Background keep-trying loop; resolve once connected.
          const keepTrying = () => {
            mongoose.connect(uri, options)
              .then(() => {
                console.log('MongoDB connected');
                resolve();
              })
              .catch(e => {
                console.error('MongoDB retry failed:', e.message);
                setTimeout(keepTrying, longBackoff);
              });
          };

          setTimeout(keepTrying, longBackoff);
        });
    };

    tryConnect();
  });
};

module.exports = connectDB;
