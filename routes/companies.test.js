
process.env.NODE_ENV = 'test';

const request = require("supertest");

const app = require("../app");
const db = require("../db")




beforeEach (async function(){
    const fakeCompany = {
        code:'abcd',
        name:'testCompany',
        description: "for testing purpose"
    }
        await db.query(
          `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description
        `,
          [fakeCompany.code, fakeCompany.name, fakeCompany.description]
        );
    
})


describe('get companies in db', function(){
    test('get all companies in db', async function(){
    const res = await request(app).get("/companies");
    expect(res.statusCode).toEqual(200);
    expect(res.body.companies[0].description).toEqual('for testing purpose')
    })
    
})

describe('get a single company with id', function() {
    test('get specific company', async () => {
        const res = await request(app).get('/companies/abcd');
        expect(res.statusCode).toBe(200);
        expect(res.body.company).toBeDefined()
    })
    test('return 404 if company not found', async() => {
        const res = await request(app).get('/wrongCompany');
        expect(res.statusCode).toBe(404)
    })
})

// describe('create a new company', function() {
//     const newCompany = {
//         code : 'new',
//         name : 'theCompany',
//         description : 'second test'
//     }
//     test('create a company', async () =>{
//         const res = await request(app).post('/').send(newCompany)
//         expect(res.body).toBe({company: {code : 'new', name : 'theCompany', description: 'second test'}})
//     })
// })

describe('update existing company', () => {
    const updatedCompany = {
        name :'updated',
        description: 'this is the updated version'
    }
    test('update company with provided code', async () => {
        const res = await request(app).put('/companies/abcd').send(updatedCompany)
         expect(res.body.company.code).toBe('abcd')
         expect(res.body.company.name).toBe('updated')
         expect(res.statusCode).toBe(200)

    })
    test('return 404 if company does not exist', async() => {
        const res = await request(app).put('/someCompany').send(updatedCompany);
        expect(res.statusCode).toBe(404)
    })
}) 


describe('delete a specific company', function () {
    test('delete company', async () => {
    const res = await request(app).delete('/companies/abcd')
    expect(res.body.message).toBe('deleted successfully')
    })
    


})












afterEach(async function() {
    await db.query(`DELETE FROM companies`)
})

afterAll(async function() {
    await db.end()
})