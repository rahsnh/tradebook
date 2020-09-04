const express = require('express');
const portfolioRoute = express.Router();
const orders = require('../models/orderSchema.js');
const portfolio = require('../models/portfolioSchema.js');

portfolioRoute.get('/portfolio', (req, res) => {
    if (req.headers['authorization'].split(" ")[1] != "abc")
        return res.send({"messageCode": 400, "message": "Invalid access token"});
    orders.aggregate([{$match: {uID: req.headers['authorization'].split(" ")[1]}},{$group: {_id: '$ticker',orders: {$push: '$$ROOT'}}},{$project: {"orders._id":0, "orders.ticker":0, "orders.uID":0, "orders.__v":0}}]).then(result => {
        if (result.length == 0) {
            result = {}
            result['messageCode'] = 200
            result['message'] = 'No Data Found'
        }
        res.send(result)
    }).catch(err => {
        res.status(500).send({"messageCode": 400, "message": "Error fetching portfolio (Server Error)"});
    })
})

portfolioRoute.get('/holdings', (req, res) => {
    if (req.headers['authorization'].split(" ")[1] != "abc")
        return res.send({"messageCode": 400, "message": "Invalid access token"});
    portfolio.find({uID: req.headers['authorization'].split(" ")[1], qty: {$gt: 0}},{_id: 0, ticker: 1, avgPrice: 1, qty: 1}).then(result => {
        if (result.length == 0) {
            result = {}
            result['messageCode'] = 200
            result['message'] = 'No Data Found'
        }
        res.send(result)
    }).catch(err => {
        res.status(500).send({"messageCode": 400, "message": "Error fetching holdings (Server Error)"});
    })
})

portfolioRoute.get('/returns', (req, res) => {
    if (req.headers['authorization'].split(" ")[1] != "abc")
        return res.send({"messageCode": 400, "message": "Invalid access token"});
    portfolio.aggregate([{$match: {uID: req.headers['authorization'].split(" ")[1]}},{$group: {_id: '', totalReturns: {$sum: {$multiply: [{$subtract: [100,'$avgPrice']},'$qty']}}}},{$project: {_id:0, totalReturns: 1}}]).then(result => {
        if (result.length == 0) {
            result = [];
            temp = {};
            temp['messageCode'] = 200;
            temp['message'] = 'No Data Found';
            result.push(temp);
        }
        res.send(result[0])
    }).catch(err => {
        res.status(500).send({"messageCode": 400, "message": "Error fetching returns (Server Error)"});
    })
})

module.exports = portfolioRoute;