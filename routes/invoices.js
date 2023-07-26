
const express = require('express');
const router = express.Router();
const db = require('../db')
const ExpressError = require('../expressError')

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices`
    );
    return res.json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("Invoice Not Found", 404);
    }
    return res.json({ invoices: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE invoices SET  amt = $1 WHERE id =$2 RETURNING id,amt`,
      [req.body.amt, id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("invoices not found", 404);
    }
    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM invoices WHERE  id = $1`, [id]);
    // if(result.rows.length === 0){
    //   throw new ExpressError('Invoice not found', 404)
    // }
    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;