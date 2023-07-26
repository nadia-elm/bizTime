
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











afterEach(async function() {
    await db.query(`DELETE FROM companies`)
})

afterAll(async function() {
    await db.end()
})