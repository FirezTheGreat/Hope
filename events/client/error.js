const Event = require("../../structures/Event");

module.exports = class Error extends Event {
    constructor(...args) {
        super(...args);
    };
    run(error) {
        console.error(`Error Occurred: ${error}`);
    };
};