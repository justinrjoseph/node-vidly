const mongoose = require('mongoose'),
      { customerSchema } = require('./customer'),
      { movieSchema } = require('./movie'),
      Joi = require('joi'),
      moment = require('moment');

const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
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
    }),
    require: true
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 255
      },
      dailyRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
      }
    }),
    require: true
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturned: Date,
  fee: {
    type: Number,
    min: 0
  }
});

rentalSchema.statics.lookup = function(customerId, movieId) {
  return this.findOne({ 'customer._id': customerId, 'movie._id': movieId });
}

rentalSchema.methods.return = function() {
  this.dateReturned = new Date();

  const daysOut = moment().diff(this.dateOut, 'days');
  this.fee = daysOut * this.movie.dailyRate;
}

const Rental = mongoose.model('Rental', rentalSchema);

function validate(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

module.exports = { Rental, validate };