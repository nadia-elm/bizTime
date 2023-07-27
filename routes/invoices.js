
const express = require('express');
const router = express.Router();
const db = require('../db')
const ExpressError = require('../expressError')

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date , paying FROM invoices`
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

// router.put("/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { amt, paying} = req.body

//     const invoiceResult = await db.query(
//         `SELECT paid, paid_date FROM invoices WHERE id = $1`,[1]
//     );

//     if(invoiceResult.rows.length === 0){
//         throw new ExpressError('Invoice not found', 404)
//     }

//     const {paid, paid_date} = invoiceResult.rows[0]
//     if(paying === true && !paid) {
//         const result = await db.query (`
//         UPDATE invoices SET amt = $1, paid = true,
//          paid_date = CURRENT_DATE 
//          WHERE id = $2
//          RETURNING id, amt, paid, paid_date`
//          [amt, id]
//          )
//          if(result.rows.length === 0){
//          throw new ExpressError("Update failed", 500);   
//          }
//          return res.json({ invoice : result.row[0]})
//     }else{
//         // if not paying or already paid update only amt
//         const result = await db.query(
//             `UPDATE invoices SET amt = $1 WHERE id = $2 
//             RETURNING id, amt, paid, paid_date`,
//             [amt,id]
//         )
//         if (result.rows.length === 0) {
//           throw new ExpressError("Update failed", 500);
//         }

//         return res.json({ invoice: result.rows[0] });
//     }
    
    
//   } catch (err) {
//     return next(err);
//   }
// });



router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paying } = req.body;

    const invoiceResult = await db.query(
      `SELECT paid, paid_date FROM invoices WHERE id = $1`,
      [id]
    );

    if (invoiceResult.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }

    const { paid, paid_date } = invoiceResult.rows[0];
    if (paying === true && !paid) {
      const result = await db.query(
        `UPDATE invoices SET amt = $1, paid = true, paid_date = CURRENT_DATE WHERE id = $2 RETURNING id, amt, paid, paid_date`,
        [amt, id]
      );

      if (result.rows.length === 0) {
        throw new ExpressError("Update failed", 500);
      }

      return res.json({ invoice: result.rows[0] });
    } else {
      // if not paying or already paid, update only the amt field
      const result = await db.query(
        `UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, amt, paid, paid_date`,
        [amt, id]
      );

      if (result.rows.length === 0) {
        throw new ExpressError("Update failed", 500);
      }

      return res.json({ invoice: result.rows[0] });
    }
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