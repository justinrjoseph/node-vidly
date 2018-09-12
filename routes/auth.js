const express = require('express'),
      router = express.Router(),
      Joi = require('joi'),
      { User } = require('../models/user'),
      bcrypt = require('bcrypt')
      jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);

  if ( error ) return res.status(400).send(error.details[0].message);

  let { email, password } = req.body;

  let user = await User.findOne({ email });

  if ( !user ) return res.status(400).send('Invalid email or password.');

  const passwordInvalid = !(await bcrypt.compare(password, user.password));

  if ( passwordInvalid ) return res.status(400).send('Invalid email or password.');

  const token = user.generateJwt();

  res.send(token);
});

function validate(user) {
  const schema = {
    email: Joi.string().required().min(7).max(255),
    password: Joi.string().required().min(8).max(1024)
  }

  return Joi.validate(user, schema);
}

module.exports = router;