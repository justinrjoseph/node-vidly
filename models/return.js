const mongoose = require('mongoose'),
      Joi = require('joi');

function validate(rentalReturn) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(rentalReturn, schema);
}

module.exports = { validate };