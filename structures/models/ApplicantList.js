const { Schema, model } = require('mongoose');

const MyApplicantSchema = new Schema({
    ApplicantID: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    SubmitDate: {
        type: String,
        required: true
    }
});

module.exports = model('ApplicantList', MyApplicantSchema, 'ApplicantList');