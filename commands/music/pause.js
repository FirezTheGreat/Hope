const Command = require("../../structures/Command");

module.exports = class Pause extends Command {
    constructor(...args) {
        super(...args, {
            name: 'pause',
            aliases: [],
            category: 'music',
            description: 'Pause The Current Song Playing',
            usage: '',
            accessableby: 'everyone'
        });
    };

    async run(message, args) {
        try {
            const player = this.bot.music.players.get(message.guild.id);
            if (!player || (player.queue.size === 0 && !player.queue.current)) return message.channel.send('**Nothing Playing In This Server!**');

            const { channel } = message.member.voice;
            if (!channel) return message.channel.send('**You Have To Be Connected To A Voice Channel!**');

            if (channel.id !== player.voiceChannel) return message.channel.send('**You Have To Be In The Same Voice Channel With The Bot!**');

            if (player.playing) {
                player.pause(true);
                return message.channel.send('**Paused** ⏸');
            } else {
                return message.channel.send(`**Song Is Already Paused!**`);
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};