const mongoose = require('mongoose'),
      config = require('config'),
      winston = require('winston');

module.exports = () => {
  const db = config.get('db');

  mongoose.connect(db, { useNewUrlParser: true })
    .then(() => winston.info(`Connected to ${db}...`));
};