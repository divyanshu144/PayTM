const express = require("express");
const mongoose = require("mongoose")
const { authMiddleware } = require("../middlewares/auth");
const { Account } = require("../models/Bank");
const router = express.Router();


router.get("/balance", authMiddleware, async (req,res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
})

router.post("/transfer", authMiddleware, async (req,res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    const {amount, to} = req.body

    // fetch the amount within the transaction

    const account = await Account.findOne({
        userId: req.body
    }).session(session);

    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res,status(400).json({
            message: "Insufficient balance"
        })
    }

    const toAccount = await Account.findOne({
        userId: to
    }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res,status(400).json({
            message: "Invalid acount"
        })
    }

    //Perform the Transfer
    await Account.updateOne({userId: req.body},{$inc: {balance: -amount}} ).session(session)
    await Account.updateOne({userId: to},{$inc: {balance: amount}} ).session(session)

    //commit the transactions
    await session.commitTransaction();

    res,json({
        message: "Transfer Successful"
    })

})

module.exports = router;