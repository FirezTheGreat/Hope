const Discord = require('discord.js');
const Filter = require('../music/filter');

module.exports = async (bot, message, filter, state) => {
    const delay = ms => new Promise(res => setTimeout(res, ms));

    const player = bot.music.players.get(message.guild.id);

    if (!state) {
        player.setEQ(...Filter.reset);
        const msg = await message.channel.send(`**Turning Off __${filter}__! This May Take A Few Seconds!**`);
        const embed = new Discord.MessageEmbed()
            .setDescription(`**Turned Off __${filter}__**`)
            .setColor('GREEN');
        await delay(5000);
        return msg.edit('', embed);
    }
    else if (state) {
        switch (filter) {
            case 'bass':
                player.setEQ(...Filter.bass.equalizer);
                break;
            case 'treblebass':
                player.setEQ(Filter.treblebass);
                break;
            case 'nightcore':
                player.setFilter(Filter.nightcore);
                break;
            case 'vaporwave':
                player.setFilter(Filter.vaporwave);
                break;
            default:
        }

        const msg = await message.channel.send(`**Turning On __${filter}__! This May Take A Few Seconds!**`);
        const embed = new Discord.MessageEmbed()
            .setDescription(`**Turned On __${filter}__**`)
            .setColor('GREEN');
        await delay(5000);
        return msg.edit('', embed);
    }
};
