const express = require('express');
const mongoose = require('mongoose');
const tradeRoute = express.Router();
const orders = require('../models/orderSchema.js');
const portfolio = require('../models/portfolioSchema.js');

var buytrade = async function(ticker, orderPrice, qty, uID) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session };
        await orders({ dt: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), ticker: ticker, transType: "Buy", orderPrice: orderPrice, qty: qty, uID: uID }).save(opts);
        const portfolioResult = await portfolio.findOne({uID: uID, ticker: ticker},{ticker: 1, avgPrice: 1, totalQty: 1},opts)
        if (portfolioResult) {
            updateValue = (portfolioResult['avgPrice']*portfolioResult['totalQty'] + orderPrice*qty)/(portfolioResult['totalQty']+qty);
            await portfolio.findOneAndUpdate({uID: uID, ticker: ticker},{$set: {avgPrice: updateValue}, $inc: {qty: qty, totalQty: qty}},opts);
        } else {
            await portfolio({uID: uID, ticker: ticker, avgPrice: orderPrice, qty: qty, totalQty: qty}).save(opts);
        }
        const portfolioDetails = await portfolio.find({uID: uID},{_id: 0, ticker: 1, avgPrice: 1, qty: 1},opts)
        await session.commitTransaction();
        session.endSession();
        return {"messageCode": 200, "message": "Successfully executed trade order", "portfolio": portfolioDetails}
    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
        return {"messageCode": 400, "message": "Error executing trade order (Server Error)"}
    }
};

var selltrade = async function(ticker, orderPrice, qty, uID) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session };
        const portfolioResult = await portfolio.findOne({uID: uID, ticker: ticker, qty: {$gte: qty}},null,opts)
        if (portfolioResult) {
            await portfolio.findOneAndUpdate({uID: uID, ticker: ticker},{$inc: {qty: -qty}},opts);
            await orders({ dt: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), ticker: ticker, transType: "Sell", orderPrice: orderPrice, qty: qty, uID: uID }).save(opts);
        }
        const portfolioDetails = await portfolio.find({uID: uID},{_id: 0, ticker: 1, avgPrice: 1, qty: 1},opts)
        await session.commitTransaction();
        session.endSession();
        if (portfolioResult) {
            return {"messageCode": 200, "message": "Successfully executed trade order", "portfolio": portfolioDetails}
        }
        return {"messageCode": 400, "message": "Insufficient shares to sell"}
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return {"messageCode": 400, "message": "Error executing trade order (Server Error)"}
    }
};

tradeRoute.post('/buy', (req, res) => {
    if (req.headers['authorization'].split(" ")[1] != "abc")
        return res.send({"messageCode": 400, "message": "Invalid access token"});
    errorMessage = {
        messageCode: 400,
        message: "Missing Input Parameters"
    }
    if (req.body.ticker == null)
        return res.send(errorMessage);
    else if (req.body.orderPrice == null)
        return res.send(errorMessage);
    else if (req.body.qty == null)
        return res.send(errorMessage);
    else if (req.body.orderPrice <= 0)
        return res.send({messageCode: 400, message: "orderPrice should be greater than 0"});
    else if (req.body.qty <= 0)
        return res.send({messageCode: 400, message: "qty should be greater than 0"});
    else if (typeof(req.body.ticker) != 'string' || typeof(req.body.orderPrice) != 'number' || typeof(req.body.qty) != 'number')
        return res.send({messageCode: 400, message: "Invalid Input parameters format"});
	let ticker = req.body.ticker;
    let orderPrice = req.body.orderPrice;
    let qty = req.body.qty;
    buytrade(ticker, orderPrice, qty, req.headers['authorization'].split(" ")[1]).then(result => {
        res.send(result)
    }).catch(err => {
        res.status(500).send({"messageCode": 400, "message": "Error executing trade order (Server Error)"});
    })
})

tradeRoute.post('/sell', (req, res) => {
    if (req.headers['authorization'].split(" ")[1] != "abc")
        return res.send({"messageCode": 400, "message": "Invalid access token"});
    errorMessage = {
        messageCode: 400,
        message: "Missing Input Parameters"
    }
    if (req.body.ticker == null)
        return res.send(errorMessage);
    else if (req.body.orderPrice == null)
        return res.send(errorMessage);
    else if (req.body.qty == null)
        return res.send(errorMessage);
    else if (req.body.orderPrice <= 0)
        return res.send({messageCode: 400, message: "orderPrice should be greater than 0"});
    else if (req.body.qty <= 0)
        return res.send({messageCode: 400, message: "qty should be greater than 0"});
    else if (typeof(req.body.ticker) != 'string' || typeof(req.body.orderPrice) != 'number' || typeof(req.body.qty) != 'number')
        return res.send({messageCode: 400, message: "Invalid Input parameters format"});
	let ticker = req.body.ticker;
    let orderPrice = req.body.orderPrice;
    let qty = req.body.qty;
    selltrade(ticker, orderPrice, qty, req.headers['authorization'].split(" ")[1]).then(result => {
        res.send(result)
    }).catch(err => {
        res.status(500).send({"messageCode": 400, "message": "Error executing trade order (Server Error)"});
    })
})

module.exports = tradeRoute;