const Command = require("../../structures/Command");

module.exports = class Join extends Command {
    constructor(...args) {
        super(...args, {
            name: 'join',
            aliases: ['connect'],
            description: 'Joins A Voice Channel',
            category: 'music',
            usage: '',
            accessableby: 'everyone'
        });
    };
    async run(message) {
        try {
            const { channel } = message.member.voice;
            if (!channel) return message.channel.send(`**Please Join A Voice Channel!**`);

            if (!channel.permissionsFor(this.bot.user).has('CONNECT')) return message.channel.send(`**No Permissions To Connect ${channel}`);

            const player = this.bot.music.players.get(message.guild.id);
            if (!player || (player && player.state === 'DISCONNECTED')) {
                this.bot.music.create({
                    guild: message.guild.id,
                    voiceChannel: channel.id,
                    textChannel: message.channel.id,
                    selfDeafen: true
                }).connect();
                return message.channel.send('**Connected**');
            } else if (!message.guild.me.voice.channel) {
                message.guild.me.voice.channel.join();
                return message.channel.send('**Connected**');
            } else {
                return message.channel.send('**I\'m Connected To A Voice Channel!**');
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};