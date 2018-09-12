const express = require('express'),
      router = express.Router(),
      validatePayload = require('../middleware/validatePayload'),
      { Movie, validate: movie } = require('../models/movie'),
      { Genre } = require('../models/genre'),
      auth = require('../middleware/auth')

const notFoundMsg = 'Movie not found.';

router.get('/', async (req, res) => {
  const movies = await Movie.find()
    .sort({ title: 1 })
    .select({ __v: 0 });

  res.send(movies);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const movie = await Movie.findById(id).select({ __v: 0 });

  if ( !movie ) return res.status(404).send(notFoundMsg);

  res.send(movie);
});

router.post('/', [auth, validatePayload(movie)], async (req, res) => {
  const { title, genreId, inStock, dailyRate } = req.body;

  const genre = await Genre.findById(genreId);

  if ( !genre ) res.status(400).send('Invalid genre.');

  const movie = new Movie({
    title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    inStock,
    dailyRate
  });

  await movie.save();

  res.send(movie);
});

router.put('/:id', [auth, validatePayload(movie)], async (req, res) => {
  const { title, genreId, inStock, dailyRate } = req.body;

  if ( genreId ) {
    const genre = await Genre.findById(genreId);

    if ( !genre ) res.status(400).send('Invalid genre.');
  }

  const { id } = req.params;

  const movie = await Movie
    .findByIdAndUpdate(id, {
        title,
        genre: {
          _id: genre._id,
          name: genre.name
        },
        inStock,
        dailyRate
      }, { new: true })
    .select({ __v: 0 });

  if ( !movie ) return res.status(404).send(notFoundMsg);

  res.send(movie);
});

router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  const movie = await Movie.findByIdAndRemove(id);

  if ( !movie ) return res.status(404).send(notFoundMsg);

  res.send(movie);
});

module.exports = router;