const mongoose = require('mongoose'),
      { genreSchema } = require('./genre'),
      Joi = require('joi');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 255
  },
  genre: {
    type: genreSchema,
    require: true
  },
  inStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  }
});

const Movie = mongoose.model('Movie', movieSchema);

function validate(movie) {
  const schema = {
    title: Joi.string().required().min(2).max(255),
    genreId: Joi.objectId().required(),
    inStock: Joi.number().required().min(0).max(255),
    dailyRate: Joi.number().required().min(0).max(255)
  };

  return Joi.validate(movie, schema);
}

module.exports = { movieSchema, Movie, validate };