const config = require('config'),
      { User } = require('../../../models/user'),
      mongoose = require('mongoose'),
      jwt = require('jsonwebtoken');

describe('user.generateJwt', () => {
  it('should return a valid JWT', () => {
    const payload = {
      _id: mongoose.Types.ObjectId().toHexString(),
      isAdmin: true
    };

    const user = new User(payload);

    const token = user.generateJwt();

    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    expect(decoded).toMatchObject(payload);
  });
});