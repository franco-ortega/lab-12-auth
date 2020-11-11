require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('posts/creates todos and gets them', async() => {

      const expectation = [
        {
          'id': 4,
          chore: 'clean kitchen',
          completed: false,
          'owner_id': 2
        },
        {
          'id': 5,
          chore: 'clean bedroom',
          completed: false,
          'owner_id': 2
        },
        {
          'id': 6,
          chore: 'clean garage',
          completed: false,
          'owner_id': 2
        }
      ];

      const testPost = await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[0])
        .set('Authorization', token)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[1])
        .set('Authorization', token)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[2])
        .set('Authorization', token)
        .expect(200);


      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(testPost.body).toEqual([{ 
        'id': 4,
        chore: 'clean kitchen',
        completed: false,
        'owner_id': 2

      }]);
    });

    test('updates todos and gets them', async() => {

      const expectation = [
        {
          'id': 4,
          chore: 'clean kitchen',
          completed: true,
          'owner_id': 2
        }
      ];

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .set('Authorization', token)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });



  });



});
