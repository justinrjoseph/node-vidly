const express = require('express'),
      app = express(),
      winston = require('winston');

require('./startup/config')();
require('./startup/api-validation')();
require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  winston.info(`Listening on port ${port}...`);
});

module.exports = server;