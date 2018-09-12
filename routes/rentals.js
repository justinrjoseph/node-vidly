const express = require('express'),
      mongoose = require('mongoose'),
      router = express.Router(),
      validatePayload = require('../middleware/validatePayload'),
      { Customer } = require('../models/customer'),
      { Movie } = require('../models/movie'),
      { Rental, validate: rental } = require('../models/rental'),
      auth = require('../middleware/auth'),
      Fawn = require('fawn');

Fawn.init(mongoose);

router.get('/', async (req, res) => {
  const rentals = await Rental.find()
    .sort({ dateOut: 1 })
    .select({ __v: 0 });

  res.send(rentals);
});

router.post('/', [auth, validatePayload(rental)], async (req, res) => {
  const { customerId, movieId } = req.body;

  const customer = await Customer.findById(customerId);

  if ( !customer ) return res.status(404).send('Customer not found.');

  const { name, phone, isGold } = customer;

  const movie = await Movie.findById(movieId);

  if ( !movie ) return res.status(404).send('Movie not found.');
  if ( movie.inStock === 0 ) return res.status(400).send('Movie not available.');

  const { title, dailyRate } = movie;

  const rental = new Rental({
    customer: { _id: customer._id, name, phone, isGold },
    movie: { _id: movie._id, title, dailyRate }
  });

  try {
    new Fawn.Task()
    .save('rentals', rental)
    .update('movies', { _id: movie._id }, {
      $inc: { inStock: -1 }
    }).run();

    res.send(rental);
  } catch(ex) {
    res.status(500).send('There was a problem processing the rental.');
  }
});

module.exports = router;