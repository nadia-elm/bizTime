
const express = require("express");
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






module.exports = router;