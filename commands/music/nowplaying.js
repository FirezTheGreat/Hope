const { MessageEmbed } = require('discord.js');
const Command = require("../../structures/Command");

module.exports = class NowPlaying extends Command {
    constructor(...args) {
        super(...args, {
            name: 'nowplaying',
            aliases: ['np'],
            category: 'music',
            description: 'Shows Details About The Current Song Playing',
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

            let video = player.queue.current;
            let description;

            if (video.isStream) {
                description = 'Live Stream';
            } else {
                const part = Math.floor((player.position / video.duration) * 30);
                const positionObj = {
                    seconds: Math.floor((player.position / 1000) % 60),
                    minutes: Math.floor((player.position / (1000 * 60)) % 60),
                    hours: Math.floor((player.position / (1000 * 60 * 60)) % 24)
                };
                const totalDurationObj = {
                    seconds: Math.floor((video.duration / 1000) % 60),
                    minutes: Math.floor((video.duration / (1000 * 60)) % 60),
                    hours: Math.floor((video.duration / (1000 * 60 * 60)) % 24)
                };
                description = `${'─'.repeat(part) + '⚪' + '─'.repeat(30 - part)}\n\n\`${this.formatDuration(positionObj)} / ${this.formatDuration(totalDurationObj)}\``;
            };

            const videoEmbed = new MessageEmbed()
                .setThumbnail(`https://i.ytimg.com/vi/${video.identifier}/hqdefault.jpg`)
                .setColor('GREEN')
                .setTitle(video.title)
                .setDescription(description)
                .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            return message.channel.send({ embed: videoEmbed });
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };

    formatDuration(durationObj) {
        const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${durationObj.minutes ? durationObj.minutes : '00'
            }:${(durationObj.seconds < 10)
                ? ('0' + durationObj.seconds)
                : (durationObj.seconds
                    ? durationObj.seconds
                    : '00')
            }`;
        return duration;
    };
};