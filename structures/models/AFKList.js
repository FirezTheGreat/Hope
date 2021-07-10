const { Schema, model } = require('mongoose');

const MyAFKSchema = new Schema({
    ID: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    name: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: false,
        default: 'afk'
    }
});

module.exports = model('AFK', MyAFKSchema, 'AFK');
