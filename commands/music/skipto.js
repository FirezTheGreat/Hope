const Command = require("../../structures/Command");

module.exports = class Skipto extends Command {
    constructor(...args) {
        super(...args, {
            name: 'skipto',
            aliases: [],
            category: 'music',
            description: 'Skips To A Particular Song In Queue',
            usage: '[song number]',
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
            if (!args[0]) return message.channel.send('**Please Enter The Song Number To Skip!**');

            if (isNaN(args[0]) || args[0] < 1) return message.channel.send('**Please Enter A Positive Integer Number!**');
            if (args[0] > player.queue.size || !player.queue[player.queue.size > 1 ? args[0] - 2 : args[0] - 1]) return message.channel.send('**Song Not Found!**');

            if (args[0] > 1 && player.queue.size != args[0]) {
                player.queue.splice(0, args[0] - 2);
                player.stop();
                return message.channel.send(`**Skipped \`${args[0] - 1 === 1 ? '1 Song' : `${args[0] - 1} Songs`}\`**`);
            } else if (args[0] > 1 && player.queue.size == args[0]) {
                player.queue.splice(0, player.queue.length - 1);
                player.stop();
                return message.channel.send(`**Skipped \`${args[0] - 1} Songs\`**`);
            };

        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};