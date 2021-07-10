const Command = require("../../structures/Command");
const filter = require("../../structures/music/filter");
const setFilter = require("../../structures/utils/setFilter");

module.exports = class Bass extends Command {
    constructor(...args) {
        super(...args, {
            name: 'bass',
            aliases: [],
            category: 'music',
            description: 'Turns On Or Off Bass Filter',
            usage: '',
            accessableby: 'everyone'
        });
    };
    async run(message) {
        try {
            let breaked = false;
            const player = this.bot.music.players.get(message.guild.id);
            if (!player || (player.queue.size === 0 && player.position === 0 && !player.playing)) return message.channel.send('**❌ Nothing Playing In This Server!**');

            const { channel } = message.member.voice;
            if (!channel) return message.channel.send(`**❌ You Are Not Connected To Any Voice Channel!**`);

            for (let i = 0; i < player.bands.length; i++) {
                if (player.bands[i] === filter.bass.equalizer[i].gain)
                    breaked = true
                break;
            };

            if (breaked) {
                setFilter(this.bot, message, 'bass', false);
            } else setFilter(this.bot, message, 'bass', true);
            return;
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};
