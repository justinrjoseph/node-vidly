const mongoose = require('mongoose'),
      Joi = require('joi');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  }
});

const Genre = mongoose.model('Genre', genreSchema);

function validate(genre) {
  const schema = { name: Joi.string().required().min(5).max(50) };

  return Joi.validate(genre, schema);
}

module.exports = { genreSchema, Genre, validate };