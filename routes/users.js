const express = require('express'),
      router = express.Router(),
      validatePayload = require('../middleware/validatePayload'),
      { User, validate: user } = require('../models/user'),
      auth = require('../middleware/auth'),
      bcrypt = require('bcrypt');

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id)
    .select({ name: 1, email: 1 });

  if ( !user ) return res.status(404).send('User not found.');

  res.send(user);
});

router.post('/', validatePayload(user), async (req, res) => {
  let { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if ( user ) return res.status(400).send('User already registered.');

  user = new User({ name, email });

  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(password, salt);

  await user.save();

  const { _id } = user;
  name = user.name;
  email = user.email;

  const token = user.generateJwt();

  res.header('x-auth-token', token).send({ _id, name, email });
});

module.exports = router;