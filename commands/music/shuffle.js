const Command = require("../../structures/Command");

module.exports = class Shuffle extends Command {
    constructor(...args) {
        super(...args, {
            name: 'shuffle',
            aliases: [],
            category: 'music',
            description: 'Shuffles The Queue',
            usage: '',
            accessableby: 'everyone'
        });
    };

    async run(message, args) {
        try {
            const player = this.bot.music.players.get(message.guild.id);
            if (!player || (player.queue.size === 0 && player.position === 0 && !player.playing)) return message.channel.send('**Nothing Playing In This Server!**');

            const { channel } = message.member.voice;
            if (!channel) return message.channel.send('**You Have To Be Connected To A Voice Channel!**');

            if (channel.id !== player.voiceChannel) return message.channel.send('**You Have To Be In The Same Voice Channel With The Bot!**');

            player.queue.shuffle();
            return message.channel.send('**Shuffled The Queue**');
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};