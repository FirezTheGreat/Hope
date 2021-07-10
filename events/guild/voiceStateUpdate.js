const Event = require('../../structures/Event');

module.exports = class VoiceStateUpdate extends Event {
    constructor(...args) {
        super(...args);
    };

    async run(oldVoice, newVoice) {
        try {
            const player = this.bot.music.players.get(oldVoice.guild.id);
            if (!player) return;

            if (!newVoice.guild.members.cache.get(this.bot.user.id).voice.channelID) this.bot.music.players.destroy(newVoice.guild.id);
            return;
        } catch (error) {
            console.error(error);
        };
    };
};