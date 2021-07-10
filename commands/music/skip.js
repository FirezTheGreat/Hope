const Command = require("../../structures/Command");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'skip',
            aliases: ['s'],
            category: 'music',
            description: 'Skips The Current Song',
            usage: '',
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
            else player.stop();

            return message.channel.send(`**Skipped ${player.queue.current.title}**`);
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};