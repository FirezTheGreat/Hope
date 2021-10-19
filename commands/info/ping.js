const { MessageEmbed } = require("discord.js");
const Command = require('../../structures/Command');

module.exports = class Ping extends Command {
    constructor(...args) {
        super(...args, {
            name: 'ping',
            category: 'Info',
            description: 'Shows The Ping Of The Bot',
            usage: '',
            accessableby: 'Everyone',
            slashCommand: true
        });
    };

    async interactionRun(interaction) {
        try {
            const message = await interaction.channel.send(`**Pinging...**`);
            const pingEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setDescription(`:hourglass_flowing_sand: ${message.createdTimestamp - interaction.createdTimestamp}\n💓 ${Math.round(this.bot.ws.ping)}`)
                .setTimestamp();
            await message.delete();
            return await interaction.reply({ embeds: [pingEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};