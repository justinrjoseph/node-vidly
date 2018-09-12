const mongoose = require('mongoose'),
      Joi = require('joi'),
      config = require('config'),
      jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 7,
    maxlength: 255
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    maxlength: 1024
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

userSchema.methods.generateJwt = function() {
  const token = jwt.sign({
    _id: this._id,
    isAdmin: this.isAdmin
  }, config.get('jwtPrivateKey'));

  return token;
}

const User = mongoose.model('User', userSchema);

function validate(user) {
  const schema = {
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().required().min(7).max(255),
    password: Joi.string().required().min(8).max(255)
  };

  return Joi.validate(user, schema);
}

module.exports = { User, validate };