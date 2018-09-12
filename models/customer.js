const mongoose = require('mongoose'),
      Joi = require('joi');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  phone: {
    type: String,
    required: true,
    minlength: 10
  },
  isGold: {
    type: Boolean,
    default: false
  }
});

const Customer = mongoose.model('Customer', customerSchema);

function validate(customer) {
  const schema = {
    name: Joi.string().required().min(2).max(50),
    phone: Joi.string().required().min(10),
    isGold: Joi.boolean()
  };

  return Joi.validate(customer, schema);
}

module.exports = { customerSchema, Customer, validate };