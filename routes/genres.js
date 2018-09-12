const express = require('express'),
      router = express.Router(),
      validatePayload = require('../middleware/validatePayload'),
      { Genre, validate: genre } = require('../models/genre'),
      auth = require('../middleware/auth'),
      admin = require('../middleware/admin'),
      validateObjectId = require('../middleware/validateObjectId');

const notFoundMsg = 'Genre not found.';

router.get('/', async (req, res) => {
  const genres = await Genre.find()
    .sort({ name: 1 })
    .select({ __v: 0 });

  res.send(genres);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const { id } = req.params;

  const genre = await Genre.findById(id).select({ __v: 0 });

  if ( !genre ) return res.status(404).send(notFoundMsg);

  res.send(genre);
});

router.post('/', [auth, validatePayload(genre)], async (req, res) => {
  const { name } = req.body;

  const genre = new Genre({ name });

  await genre.save();

  res.send(genre);
});

router.put('/:id', [auth, validateObjectId, validatePayload(genre)], async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const genre = await Genre
    .findByIdAndUpdate(id, { name }, { new: true })
    .select({ __v: 0 });

  if ( !genre ) return res.status(404).send(notFoundMsg);

  res.send(genre);
});

router.delete('/:id', [auth, validateObjectId, admin], async (req, res) => {
  const { id } = req.params;

  const genre = await Genre.findByIdAndRemove(id);

  if ( !genre ) return res.status(404).send(notFoundMsg);

  res.send(genre);
});

module.exports = router;