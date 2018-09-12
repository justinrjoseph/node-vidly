const request = require('supertest'),
      { Movie } = require('../../models/movie'),
      { Rental } = require('../../models/rental'),
      { User } = require('../../models/user'),
      mongoose = require('mongoose'),
      moment = require('moment');

describe('/api/returns', () => {
  let server;
  let customerId;
  let movieId;
  let movie;
  let rental;
  let token;

  beforeEach(async () => {
    server = require('../../index');

    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    token = new User().generateJwt();

    movie = new Movie({
      _id: movieId,
      title: 'title',
      genre: { name: 'genre1' },
      inStock: 10,
      dailyRate: 2
    });

    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: 'asdfj',
        phone: '12345674890'
      },
      movie: {
        _id: movieId,
        title: 'title',
        dailyRate: 2
      }
    });

    await rental.save();
  });

  afterEach(async () => {
    await Movie.remove({});
    await Rental.remove({});
    await server.close();
  });

  const exec = () => {
    return request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });
  };

  it('should return 401 if user is not logged in', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if customerId is not passed', async () => {
    customerId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if movieId is not passed', async () => {
    movieId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if rental does not exist', async () => {
    await Rental.remove({});

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if return is already processed', async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if return is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it('should set dateReturned for a valid return', async () => {
    await exec();

    const rentalInDb = await Rental.findById(rental._id);
    const timeDifference = new Date() - rentalInDb.dateReturned;

    expect(timeDifference).toBeLessThan(10 * 1000);
  });

  it('should calculate the fee of a return', async () => {
    rental.dateOut = moment().add(-7, 'days').toDate();
    await rental.save();

    await exec();

    const rentalInDb = await Rental.findById(rental._id);

    expect(rentalInDb.fee).toBe(14);
  });

  it('should increase the stock of a returned rental', async () => {
    await exec();

    const movieInDb = await Movie.findById(movie._id);

    expect(movieInDb.inStock).toBe(movie.inStock + 1);
  });

  it('should return the rental if it is valid', async () => {
    const res = await exec();

    expect(Object.keys(res.body)).toEqual(expect.arrayContaining([
      'customer', 'movie', 'dateOut', 'dateReturned', 'fee'
    ]));
  });
});