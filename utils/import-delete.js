require('dotenv').config({ path: `${__dirname}/../config.env` });
const fs = require('fs');
const Tour = require('../models/tourModel');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8')
);

require('./db')();

const importData = async () => {
  try {
    await Tour.insertMany(tours);
    console.log('Data loaded...');
    process.exit(1);
  } catch (err) {
    console.log(err.name, err.message);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted...');
    process.exit(1);
  } catch (err) {
    console.log(err.name, err.message);
    process.exit(1);
  }
};

if (process.argv[2] === 'import') {
  importData();
} else if (process.argv[2] === 'delete') {
  deleteData();
}
