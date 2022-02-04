const mongoose = require('mongoose');

const DB = process.env.MONGODB_URI.replace(
  '<password>',
  process.env.MONGODB_PASSWORD
);

const localDB = process.env.MONGODB_LOCAL;

const connectDB = async () => {
  const conn = await mongoose.connect(DB);
  console.log(`Database connect on ${conn.connection.host}`);
};

module.exports = connectDB;
