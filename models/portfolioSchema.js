// Import required Modules
const mongoose = require('mongoose');

// Configuring portfolio Schema
const portfolioSchema = new mongoose.Schema({
    ticker: {
        type: mongoose.Schema.Types.String
    },
    avgPrice: {
        type: mongoose.Schema.Types.Mixed
    },
    qty: {
        type: mongoose.Schema.Types.Number
    },
   totalQty: {
        type: mongoose.Schema.Types.Number
    },
    uID: {
        type: mongoose.Schema.Types.String
    }
})

// Connecting portfolio Collection
const portfolio = mongoose.model('portfolios', portfolioSchema);

module.exports = portfolio;
