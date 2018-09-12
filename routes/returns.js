const express = require('express'),
      router = express.Router(),
      validatePayload = require('../middleware/validatePayload'),
      auth = require('../middleware/auth'),
      { Movie } = require('../models/movie'),
      { Rental } = require('../models/rental'),
      { validate: rentalReturn } = require('../models/return');

router.post('/', [auth, validatePayload(rentalReturn)], async (req, res) => {
  const { customerId, movieId } = req.body;

  const rental = await Rental.lookup(customerId, movieId);

  if ( !rental ) return res.status(404).send('Rental not found.');

  if ( rental.dateReturned ) return res.status(400).send('Return already processed.');

  rental.return();
  await rental.save();

  await Movie.update({ _id: rental.movie._id }, {
    $inc: { inStock: 1 }
  });

  res.send(rental);
});

module.exports = router;