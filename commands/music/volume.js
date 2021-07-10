const Command = require("../../structures/Command");

module.exports = class Volume extends Command {
    constructor(...args) {
        super(...args, {
            name: 'volume',
            aliases: ['vol'],
            category: 'music',
            description: 'Change Volume Or See The Current Volume',
            usage: '[amount] (1-10)',
            accessableby: 'everyone'
        });
    };

    async run(message, args) {
        try {
            const { channel } = message.member.voice;
            if (!channel) return message.channel.send('**You Have To Be Connected To A Voice Channel!**');

            const player = this.bot.music.players.get(message.guild.id);
            if (!player || (player.queue.size === 0 && player.position === 0 && !player.playing)) return message.channel.send('**Nothing Playing In This Server!**');
            if (channel.id !== player.voiceChannel) return message.channel.send('**You Have To Be In The Same Voice Channel With The Bot!**');

            if (!args[0]) return message.channel.send(`**Current Volume: \`${player.volume / 10}/10\`**`);
            if (isNaN(args[0])) return message.channel.send(`**Please Enter A Positive Integer!**`);

            if (args[0] < 11 && args[0] > 0) {
                player.setVolume(parseInt(args[0]) * 10);
                return message.channel.send(`**Volume Set To: \`${args[0]}\`**`);
            } else {
                return message.channel.send('**Select Volume From 1-10**');
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};