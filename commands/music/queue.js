const Command = require("../../structures/Command");
const { MessageEmbed } = require('discord.js');

module.exports = class Queue extends Command {
    constructor(...args) {
        super(...args, {
            name: 'queue',
            aliases: ['q'],
            category: 'music',
            description: 'Shows The Queue Of Songs',
            usage: '',
            accessableby: 'everyone'
        });
    };

    async run(message) {
        try {
            const { channel } = message.member.voice;
            if (!channel) return message.channel.send('**You Have To Be Connected To A Voice Channel!**');

            const player = this.bot.music.players.get(message.guild.id);
            if (!player || (player.queue.size === 0 && player.position === 0 && !player.playing)) return message.channel.send('**Nothing Playing In This Server!**');
            if (channel.id !== player.voiceChannel) return message.channel.send('**You Have To Be In The Same Voice Channel With The Bot!**');

            let currentPage = 0;
            const embeds = this.generateQueueEmbed(message, player.queue);
            const queueEmbed = await message.channel.send(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
            await queueEmbed.react('⬅️');
            await queueEmbed.react('⏹')
            await queueEmbed.react('➡️');

            const filter = (reaction, user) => ['⬅️', '⏹', '➡️'].includes(reaction.emoji.name) && (message.author.id === user.id);
            const collector = queueEmbed.createReactionCollector(filter)

            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === '➡️') {
                    if (currentPage < embeds.length - 1) {
                        currentPage++;
                        queueEmbed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                    }
                } else if (reaction.emoji.name === '⬅️') {
                    if (currentPage !== 0) {
                        --currentPage;
                        queueEmbed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                    }
                } else {
                    collector.stop();
                    reaction.message.reactions.removeAll();
                }
                await reaction.users.remove(message.author.id)
            });
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };

    generateQueueEmbed(message, queue) {
        const embeds = [];
        let size = queue.size === 0 && queue.current !== null ? 1 : queue.size;
        let k = 10;
        for (let i = 0; i < size; i += 10) {
            const current = queue.size === 0 ? [] : queue.slice(embeds.length === 0 ? i : i - 1, embeds.length === 0 ? k - 1: k - 1);
            let j;
            embeds.length === 0 ? j = i : j = i - 1;
            k += 10;
            const info = current.length === 0 ? '' : current.map(track => `${++j + 1} - [${track.title}](${track.url})`).join('\n');
            const embed = new MessageEmbed()
                .setAuthor(`${this.bot.user.username} Queue`, this.bot.user.displayAvatarURL())
                .setTitle('Song Queue\n')
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .setColor('GREEN')
                .setDescription(`\n**Current Song** - [${queue.current.title}](${queue.current.url})\n\n${info}`)
                .setFooter(`Requested By - ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            embeds.push(embed);
        };
        return embeds;
    };
};