const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message, player, searchQuery, playlist, TotalLength, currLength) => {
    async function load(search) {
        try {
            const res = await bot.music.search(search, message.author);
            if (res.loadType !== 'NO_MATCHES' && res.loadType !== 'LOAD_FAILED') {
                if (res.loadType === 'TRACK_LOADED' || res.loadType === 'SEARCH_RESULT') {
                    player.queue.add(res.tracks[0]);
                    if (!playlist) {
                        const track = res.tracks[0];
                        const user = bot.users.cache.get(track.requester.id);

                        if (!player.playing && !player.paused && player.state === 'CONNECTED') {
                            player.play();
                            return;
                        }
                        else {
                            const sembed = new MessageEmbed()
                                .setColor('GREEN')
                                .setTitle('Added To Queue')
                                .setThumbnail(`https://i.ytimg.com/vi/${track.identifier}/hqdefault.jpg`)
                                .setDescription(`**${track.title}** has been added to queue! | Requested By **${track.requester.username}**`)
                                .setFooter(track.requester.username, user.displayAvatarURL({ dynamic: true }))
                                .setTimestamp();
                            return message.channel.send({ embed: sembed });
                        };
                    } else {
                        if (!player.playing && !player.paused && TotalLength === currLength) return player.play();
                    };
                } else if (res.loadType === 'PLAYLIST_LOADED') {
                    for (const track of res.tracks) player.queue.add(track);
                    if (!player.playing && !player.paused) return player.play();
                };
                return;
            } else return message.channel.send(`**:x: No Matches!**`);
        } catch (error) {
            return console.error(error);
        };
    };
    return load(searchQuery);
};