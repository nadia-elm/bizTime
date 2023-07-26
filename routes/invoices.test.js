
process.env.NODE_ENV='test';
const request = require('supertest')

const app = require('../app')
const db = require('../db')

let testInvoice;
let testCompany;
// const fakeCompany = {
//   code: "abcd",
//   name: "testCompany",
//   description: "for testing purpose",
// };

beforeEach(async function () {
  let compResult = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('abcd', 'testCompany', 'for testing purpose')
        RETURNING code, name, description
    `);
  testCompany = compResult.rows[0];

  let invoiceResult = await db.query(`
        INSERT INTO invoices (comp_Code, amt, paid, paid_date)
        VALUES ('abcd', 123, false, null)
        RETURNING id, comp_Code, amt, paid, paid_date, add_date
    `);
  testInvoice = invoiceResult.rows[0];
});

describe("GET /invoices", function () {
  test("Get list of invoices", async function () {
    const response = await request(app).get(`/invoices`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      invoices: [{ 
            id: testInvoice.id,
            comp_code: testInvoice.comp_code,
            amt: testInvoice.amt,
            paid: testInvoice.paid,
            paid_date: testInvoice.paid_date,
            add_date: testInvoice.add_date.toISOString(),
         }],
    });
  });
  test('handle non-existing route', async function () {
    const res = await request(app).get('/someRoute');
    expect(res.statusCode).toEqual(404);
  })
   
});



describe("GET /invoices/:id",  () => {
    test("Get specific invoice info", async function () {
    const response = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
         invoices:
    {

        id: testInvoice.id,
        comp_code: testInvoice.comp_code,
        amt: testInvoice.amt,
        paid: testInvoice.paid,
        paid_date: testInvoice.paid_date,
        add_date: testInvoice.add_date.toISOString()
    }
        

    })
    })

    test("Get invoice that does not exist", async function () {
      const response = await request(app).get(`/invoices/0`);
      expect(response.statusCode).toEqual(404);
    });
})






afterEach(async  () => {
  // delete any data created by test
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
});

afterAll(async () =>{
  // close db connection
  await db.end();
})