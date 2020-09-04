const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    dt: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    ticker: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    transType: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    orderPrice: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    qty: {
        type: mongoose.Schema.Types.Number,
        required: true
    },
    uID: {
        type: mongoose.Schema.Types.String,
        required: true
    }
})

const orders = mongoose.model('orders', orderSchema);

module.exports = orders;