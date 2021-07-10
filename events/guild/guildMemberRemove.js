const Event = require("../../structures/Event");

module.exports = class GuildMemberRemove extends Event {
    constructor(...args) {
        super(...args);
    };

    async run(member) {
        try {
            const channel = member.guild.channels.cache.find(r => r.name.toLowerCase() === '🚪log-book');
            if (!channel) return;

            return await channel.send(`**${member.user.tag} just left the server :worried:**`);
        } catch (error) {
            return console.error(error);
        };
    };
};