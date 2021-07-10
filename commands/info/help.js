const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');
const { readdirSync } = require('fs');
const { PREFIX } = require('../../config.json');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'help',
            aliases: ['h'],
            description: `Displays Every Command Of HOPE Bot`,
            category: 'info',
            usage: '[command] (optional)',
            accessableby: 'everyone'
        });
    };
    async run(message, [command]) {
        try {
            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setThumbnail(this.bot.user.displayAvatarURL({ dynamic: true }))

            if (!command) {
                embed.setAuthor(`${message.guild.me.displayName} Help`, message.guild.iconURL({ dynamic: true }))
                const categories = readdirSync("./commands/")

                embed.setDescription(`**These Are the Available Commands For ${message.guild.me.displayName}\nBot's Prefix Is \`${PREFIX}\`\n\nFor Help Related To A Particular Command Type -\n\`${PREFIX}help [command name | alias]\`**`)
                embed.setFooter(`${message.guild.me.displayName} | Total Commands - ${this.bot.commands.size}`, this.bot.user.displayAvatarURL({ dynamic: true }));

                categories.forEach(category => {
                    const dir = this.bot.commands.filter(c => c.category === category)
                    const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1)
                    try {
                        embed.addField(` ${capitalise} [${dir.size}] - `, dir.map(c => `\`${c.name}\``).join(", "))
                    } catch (error) {
                        console.error(error);
                        return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
                    };
                });

                return message.channel.send(embed)
            } else {
                embed.setAuthor(`${message.guild.me.displayName} Help`, this.bot.user.displayAvatarURL({ dynamic: true }))
                let cmd = this.bot.commands.get(command) || this.bot.commands.get(this.bot.aliases.get(command));
                if (!cmd) return message.channel.send(embed.setTitle("**Invalid Command!**").setDescription(`**Do \`${PREFIX}help\` For the List Of the Commands!**`))

                embed.setDescription(`**The Bot's Prefix Is \`${PREFIX}\`**\n
** Command -** ${cmd.name.slice(0, 1).toUpperCase() + cmd.name.slice(1)}\n
** Description -** ${cmd.description || "No Description provided."}\n
** Category -** ${cmd.category}\n
** Usage -** ${cmd.usage ? `\`${PREFIX}${cmd.name} ${cmd.usage}\`` :`\`${PREFIX}${cmd.name}\``}\n
** Accessible by -** ${cmd.accessableby || "everyone"}\n
** Aliases -** ${cmd.aliases ? cmd.aliases.join(", ") : "None."}`)
                embed.setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                embed.setTimestamp();

                return await message.channel.send({ embed: embed });
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};
