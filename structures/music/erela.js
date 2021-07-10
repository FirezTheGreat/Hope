const { Manager } = require('erela.js');
const { ERELA_OPTIONS } = require('../../config.json');
const { MessageEmbed } = require('discord.js');
const { formatTime } = require('../../functions');

module.exports = {
    connect: (bot) => {
        bot.music = new Manager({
            nodes: [{
                host: ERELA_OPTIONS.host,
                port: ERELA_OPTIONS.port,
                password: ERELA_OPTIONS.password
            }],
            autoPlay: true,
            send(id, payload) {
                const guild = bot.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            }
        });

        bot.music.on('nodeConnect', () => console.log('Node Connected'))
        bot.music.on('nodeError', (node, error) => console.log(`Node Error: ${error.message}`))
        bot.music.on("trackStart", (player, track) => {
            const user = bot.users.cache.get(track.requester.id);
            const embed = new MessageEmbed()
                .setAuthor(track.requester.username, user.displayAvatarURL({ dynamic: true }))
                .setTitle('Now Playing')
                .setColor('GREEN')
                .setThumbnail(`https://i.ytimg.com/vi/${track.identifier}/hqdefault.jpg`)
                .setDescription(`:musical_note: ${track.title} :musical_note:\n\nSong Length: **${formatTime(track.duration, true)}**`)
                .setTimestamp();
            bot.channels.cache.get(player.textChannel).send({ embed: embed });
        })
        bot.music.on('playerMove', (player, currentChannel, newChannel) => {
            player.voiceChannel = bot.channels.cache.get(newChannel);
        })
        bot.music.on("queueEnd", player => {
            player.destroy(player.guild.id);
        });
    }
};
