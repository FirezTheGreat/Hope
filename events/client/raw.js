const Event = require('../../structures/Event');

module.exports = class extends Event {
    constructor(...args) {
        super(...args);
    }

    async run(data) {
        try {
            if (this.bot.music) this.bot.music.updateVoiceState(data);
        } catch (error) {
            console.error(error);
        };
    };
};