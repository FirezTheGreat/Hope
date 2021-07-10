const { MessageEmbed } = require("discord.js");
const Command = require('../../structures/Command');

module.exports = class Ping extends Command {
    constructor(...args) {
        super(...args, {
            name: 'ping',
            aliases: [],
            category: 'info',
            description: 'Shows The Ping Of The Bot',
            usage: '',
            accessableby: 'everyone'
        });
    };

    async run(message, args) {
        try {
            const msg = await message.channel.send(`**Pinging...**`);
            const embed = new MessageEmbed()
                .setColor("GREEN")
                .setDescription(`:hourglass_flowing_sand: ${msg.createdTimestamp - message.createdTimestamp}\n💓 ${Math.round(this.bot.ws.ping)}`)
            await msg.edit(``, { embed: embed });
        } catch (error) {
            console.error(error);
        };
    };
};
