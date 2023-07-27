
const express = require("express");
const slugify = require('slugify')
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// return list of companies
router.get("/", async (req,res, next) => {
    try{
        const result = await db.query(
            `SELECT code, name, description FROM companies`
        )
        return res.json({ companies : result.rows})

    
    }catch(err){
        return next(err)
    }
})

// return a single company 

router.get("/:code", async (req, res, next) => {
  try {
    const result = await db.query(
      `
        SELECT code, name, description FROM  companies WHERE code = $1`,
      [req.params.code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("Not Found", 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// create new company
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name)
    const result = await db.query(
      `INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`,
      [code, name, description]
    );
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// update a company
router.put("/:code", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      `
        UPDATE companies SET name = $1, description = $2 WHERE code = $3
        RETURNING code, name, description
        `,
      [name, description, req.params.code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError("Company Not Found", 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// delete a specific company
router.delete("/:code", async (req, res, next) => {
  try {
    const result = await db.query(
      `
        DELETE FROM companies WHERE code = $1
        `,
      [req.params.code]
    );
    return res.json({ message: "deleted successfully" });
  } catch (e) {
    return next(e);
  }
});







module.exports = router;