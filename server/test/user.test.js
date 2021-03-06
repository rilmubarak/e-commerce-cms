const request = require('supertest')
const app = require('../app')
const { encode } = require('../helper/jwt')
const { User, sequelize } = require('../models')
const { queryInterface } = sequelize

beforeAll ((done) => {
    let input = {
        email: "admin@mail.com",
        password: "12345",
        role: "admin"
    }
    User.create(input)
    .then((user) => {
        access_token = encode({
            id: user.id,
            email: user.email
        })
        done()
    }).catch((err) => {
        done(err)
    });
})

afterAll ( async (done) => {
    try {
        await queryInterface.bulkDelete(`Users`, {})
        done()
    } catch(err) {
        done(err)
    }
})

let correctUser = {
    email: "admin@mail.com",
    password: "12345",
}

let incorrectUser = {
    email: "admin2@mail.com",
    password: "24234",
}

describe('POST /login', () => {

    test('(200) success login', (done) => {
        return request(app)
            .post('/login')
            .send(correctUser)
            .set('Accept', 'application/json')
            .then((response) => {
                const { status, body } = response
                expect(status).toBe(200)
                expect(body).toHaveProperty('access_token', expect.any(String))
                done()
            })
            .catch((err) => {
                done(err)
            })
    })

    test('(400) Failed login response, email or password incorrect', (done) => {
        request(app)
            .post('/login')
            .send(incorrectUser)
            .set('Accept', 'application/json')
            .then((response) => {
                const { status, body } = response
                expect(status).toBe(400)
                expect(body).toHaveProperty('message', 'email or password incorrect')
                done()
            })
            .catch((err) => {
                done(err)
            })
    });
})
  