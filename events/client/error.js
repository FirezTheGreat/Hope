const Event = require("../../structures/Event");

module.exports = class Error extends Event {
    constructor(...args) {
        super(...args);
    };
    run(error) {
        console.error(`error.js logged an Error: ${error}`);
    };
};
