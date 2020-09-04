// Import all the required Modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

require('dotenv').config();
// Connection to Mongodb
const db_url = 'mongodb://localhost:27017/defaultdb';
// Parsing the request URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Mongo Connection Options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// Establishing MongoDB Connection
mongoose.connect(db_url, options, function(err,db) {
    if (err) {
        console.log(err+'Unable to connect to the mongoDB server');
    } else {
        console.log('Connection established');
    }
})

// Routing to trade endpoints
const tradeRoute = require('./routes/tradeRoute');
app.use('/v1/trade', tradeRoute);

// Routing to portfolio endpoints
const portfolioRoute = require('./routes/portfolioRoute');
app.use('/v1/fetch', portfolioRoute);

// Starting NodeJs app in a particular port
app.listen(process.env.PORT || 5000);
console.log('started application');
