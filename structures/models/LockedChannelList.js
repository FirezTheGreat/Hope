const { Schema, model } = require('mongoose');

const MyLockedChannelSchema = new Schema({
    ChannelID: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    timeoutInMS: {
        type: Number,
        required: true
    },
    lockedAt: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    }
});

module.exports = model('LockedChannelList', MyLockedChannelSchema, 'LockedChannelList');