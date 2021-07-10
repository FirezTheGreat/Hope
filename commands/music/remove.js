const Command = require("../../structures/Command");

module.exports = class Remove extends Command {
    constructor(...args) {
        super(...args, {
            name: 'remove',
            aliases: [],
            category: 'music',
            description: 'Removes A Song From Queue',
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

            if (isNaN(args[0]) || args[0] < 1) return message.channel.send('**Please Enter A Positive Integer!**');

            if (args[1]) {
                if (isNaN(args[1])) return message.channel.send('**Please Enter A Positive Integer!**');
                if (args[0] - 1 === 0 || args[1] - 1 === 0) return message.channel.send(`**Cannot Remove A Song That Is Already Being Played!**`);

                if (args[0] > player.queue.size || args[1] > player.queue.size) return message.channel.send('**Song Not Found!**');
                if (args[0] > args[1]) return message.channel.send('**First Number Should Be Less Than Second Number!**');

                const songsToRemove = args[1] - args[0];
                player.queue.splice(args[0] - 2, songsToRemove + 1);
                return message.channel.send(`**Removed \`${songsToRemove + 1}\` Songs From The Queue!**`);
            } else {
                if (args[0] - 1 === 0) return message.channel.send(`**Cannot Remove A Song That Is Already Being Played!**`);
                if (args[0] - 1 > player.queue.size) return message.channel.send('**Song Not Found!**');

                const { title } = player.queue[args[0] - 2];

                player.queue.splice(args[0] - 2, 1);
                return message.channel.send(`**Removed \`${title}\` From The Queue!**`);
            };
        } catch (error) {
            console.error(error);
        };
    };
};