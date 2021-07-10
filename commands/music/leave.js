const Command = require("../../structures/Command");

module.exports = class Leave extends Command {
    constructor(...args) {
        super(...args, {
            name: 'leave',
            aliases: ['dc', 'disconnect', 'stop'],
            description: 'Disconnects From Voice Channel',
            category: 'music',
            usage: '',
            accessableby: 'everyone'
        });
    };

    async run(message) {
        try {
            const { channel } = message.member.voice;
            if (!channel) return message.channel.send('**You Have To Be Connected To A Voice Channel!**');

            const player = this.bot.music.players.get(message.guild.id);
            if (!player) return message.channel.send('**I\'m Not Connected To Any Voice Channel!**');
            if (channel.id !== player.voiceChannel) return message.channel.send('**You Have To Be In The Same Voice Channel With The Bot!**');

            if (player) {
                player.destroy();
                return message.channel.send('**Disconnected**');
            } else if (message.guild.me.voice.channel) {
                message.guild.me.voice.channel.leave();
                return message.channel.send('**Disconnected**');
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};