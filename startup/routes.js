const express = require('express'),
      users = require('../routes/users'),
      auth = require('../routes/auth'),
      customers = require('../routes/customers'),
      movies = require('../routes/movies'),
      genres = require('../routes/genres'),
      rentals = require('../routes/rentals'),
      returns = require('../routes/returns'),
      error = require('../middleware/error');

module.exports = (app) => {
  app.use(express.json());

  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/movies', movies);
  app.use('/api/genres', genres);
  app.use('/api/customers', customers);
  app.use('/api/rentals', rentals);
  app.use('/api/returns', returns);

  app.use(error);
};