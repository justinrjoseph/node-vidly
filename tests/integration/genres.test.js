const request = require('supertest'),
      { Genre } = require('../../models/genre'),
      { User } = require('../../models/user'),
      mongoose = require('mongoose');

describe('/api/genres', () => {
  let server;

  beforeEach(() => server = require('../../index'));

  afterEach(async () => {
    await Genre.remove({});
    await server.close();
  });

  describe('GET /', () => {
    it('should return all genres', async () => {
      await Genre.collection.insertMany([
        { name: 'genre1' },
        { name: 'genre2' }
      ]);

      const res = await request(server).get('/api/genres');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((genre) => genre.name === 'genre1')).toBeTruthy();
      expect(res.body.some((genre) => genre.name === 'genre2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/genres/1');

      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with the given id exists', async () => {
      const id = mongoose.Types.ObjectId();

      const res = await request(server).get(`/api/genres/${id}`);

      expect(res.status).toBe(404);
    });

    it('should return a genre if valid id is passed', async () => {
      const genre = new Genre({ name: 'genre1' });

      await genre.save();

      const res = await request(server).get(`/api/genres/${genre._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });
  });

  describe('POST /', () => {
    let token;
    let name;

    beforeEach(() => {
      token = new User().generateJwt();
      name = 'genre1';
    });

    const exec = () => {
      return request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name });
    };

    it('should return 401 if user is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if genre name is shorter than five characters', async () => {
      name = 'asdf';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre name is longer than fifty characters', async () => {
      name = Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      await exec();

      const genre = await Genre.find({ name: 'genre1' });

      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });

  describe('PUT /:id', () => {
    let token;
    let genre;
    let id;
    let name;

    beforeEach(async () => {
      token = new User().generateJwt();

      genre = new Genre({ name: 'genre1' });

      id = genre._id;

      await genre.save();

      name = 'updated genre';
    });

    const exec = () => {
      return request(server)
        .put(`/api/genres/${id}`)
        .set('x-auth-token', token)
        .send({ name });
    };

    it('should return 401 if user is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if genre name is shorter than five characters', async () => {
      name = 'asdf';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre name is longer than fifty characters', async () => {
      name = Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid id is passed', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with the given id exists', async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should update the genre if the name is valid', async () => {
      await exec();

      const genre = await Genre.find({ name: 'updated genre' });

      expect(genre).not.toBeNull();
    });

    it('should return the genre if the name is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'updated genre');
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let genre;
    let id;

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateJwt();

      genre = new Genre({ name: 'genre1' });

      id = genre._id;

      await genre.save();
    });

    const exec = () => {
      return request(server)
        .delete(`/api/genres/${id}`)
        .set('x-auth-token', token);
    };

    it('should return 401 if user is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateJwt();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid id is passed', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with the given id exists', async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the genre if valid id is passed', async () => {
      await exec();

      const genreInDb = await Genre.findById(id);

      expect(genreInDb).toBeNull();
    });

    it('should return the deleted genre', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });
});