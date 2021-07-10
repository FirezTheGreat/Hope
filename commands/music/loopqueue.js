const Command = require("../../structures/Command");

module.exports = class LoopQueue extends Command {
    constructor(...args) {
        super(...args, {
            name: 'loopqueue',
            aliases: ['lq'],
            category: 'music',
            description: 'Loops The Entire Queue',
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

            if (!player.queueRepeat) {
                player.setQueueRepeat(true);
                return message.channel.send('**🔁 Queue Has Been Looped!**');
            } else {
                player.setQueueRepeat(false);
                return message.channel.send('**🔁 Queue Has Been Unlooped!**');
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};