const { MessageEmbed } = require('discord.js');
const { KSoftClient } = require('ksoft.js');
const { KSOFT_API_TOKEN } = require('../../config');
const Command = require('../../structures/Command');
const ksoft = new KSoftClient(KSOFT_API_TOKEN);

module.exports = class Lyrics extends Command {
    constructor(...args) {
        super(...args, {
        name: 'lyrics',
        aliases: ['l'],
        category: 'music',
        description: 'Shows Lyrics Of The Current Song Playing',
        usage: ' ',
        accessableby: 'everyone'
    });
};
    async run (message) {
        try {
            let song, data;
            const player = this.bot.music.players.get(message.guild.id);
            if (!player || (player.queue.size === 0 && player.position === 0 && !player.playing)) return message.channel.send('**Nothing Playing In This Server!**');
            else song = player.current.title;

            try {
                return message.channel.send(`Lyrics Command Not Available Currently`);
                data = await ksoft.lyrics.get(song, false);
            } catch (error) {
                console.error(error);
                return message.channel.send(`*Lyrics Not Found!**`);
            };

            const LyricsEmbed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle(`Lyrics For ${data.name}`)
                .setColor('GREEN')
                .addField(`Artist - ${data.artist.name}`, data.lyrics.slice(0, 2045) + '...')
                .setFooter('Powered By Ksoft.Si')
                .setTimestamp();
            return message.channel.send({ embed: LyricsEmbed });
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};