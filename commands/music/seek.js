const Command = require("../../structures/Command");
const { parseTime } = require("../../structures/functions");

module.exports = class Seek extends Command {
    constructor(...args) {
        super(...args, {
            name: 'seek',
            aliases: [],
            description: 'Seeks To The Given Timestamp Of The Song',
            category: 'music',
            usage: '[timestamp]',
            accessableby: 'everyone'
        });
    };

    async run(message, args) {
        try {
            const player = this.bot.music.players.get(message.guild.id);
            if (!player || (player.queue.size === 0 && player.position === 0 && !player.playing)) return message.channel.send('**Nothing Playing In This Server!**');

            const { channel } = message.member.voice;
            if (!channel) return message.channel.send('**You Are Not Connected To Any Voice Channel!**');

            if (player.voiceChannel === channel.id) {
                let timestampInMS = parseTime(args.join(''));

                if (timestampInMS === null) return message.channel.send(`**Please Enter Time In This Format!\n\n\`\`\`css\n1s, 1m, 1h, 1d, 1w, 1month, 1y\`\`\`**`);
                if (timestampInMS > player.queue.current.duration || timestampInMS < 0) return message.channel.send('**Cannot Seek Beyond Length Of Song!\nPlease Enter Time In This Format!\n\n\`\`\`css\n1s, 1m, 1h, 1d, 1w, 1month, 1y\`\`\`**');

                player.seek(timestampInMS);
                return message.channel.send('**▶️ Seeked!**');
            } else {
                return message.channel.send('**Please Join The Voice Channel In Which The Bot Is Currently Playing Music!**');
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};