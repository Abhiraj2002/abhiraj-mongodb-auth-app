const mongoose = require('mongoose');
require('dotenv').config();

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Mongoose Connected');
  } catch (error) {
    console.error(error.message);
    process.exit();
  }
};
module.exports = dbConnect;
