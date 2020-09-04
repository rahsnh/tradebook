const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

require('dotenv').config();
const db_url = 'mongodb+srv://rahsnh:Rahul.09@cluster0.jcwev.mongodb.net/cluster0?retryWrites=true&w=majority';
//const db_url = 'mongodb://localhost:27017/defaultdb';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(db_url, options, function(err,db) {
    if (err) {
        console.log(err+'Unable to connect to the mongoDB server');
    } else {
        console.log('Connection established');
    }
})

const tradeRoute = require('./routes/tradeRoute');
app.use('/v1/trade', tradeRoute);

const portfolioRoute = require('./routes/portfolioRoute');
app.use('/v1/fetch', portfolioRoute);

app.listen(5000);
console.log('started application');
