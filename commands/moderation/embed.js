const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Command = require('../../structures/Command');
const buttonOptions = [
    { customId: 'yes', value: '✅' }, { customId: 'no', value: 'cz_cross:590234470221742146' }
];

module.exports = class Embed extends Command {
    constructor(...args) {
        super(...args, {
            name: 'embed',
            description: 'Embeds A Message',
            category: 'Moderation',
            usage: '[channel name] (message)',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'channel', type: 'CHANNEL', description: 'Channel to Send', required: true },
                { name: 'content', type: 'STRING', description: 'Message to Embed', required: false }
            ],
            buttonCommands: ['yes', 'no']
        });
    };
    async interactionRun(interaction) {
        try {
            await interaction.deferReply();

            const access = interaction.guild.roles.cache.get('859313087030493207');
            if (!access) return interaction.editReply('**Role Not Found - Access**!');
            if (!interaction.member.roles.cache.has(access.id) && !interaction.member.permissions.has('MANAGE_GUILD')) return interaction.editReply('**You Are Missing Permissions - [MANAGE_GUILD] To Execute This Command**!');

            const channel = interaction.options.getChannel('channel');
            if (!channel) return interaction.editReply('**Channel Not Found!**');

            const content = interaction.options.getString('content') || null;

            const row_first = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('yes')
                        .setEmoji('✅')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('no')
                        .setEmoji('cz_cross:590234470221742146')
                        .setStyle('DANGER')
                );

            const message = await interaction.editReply({ content: '**Do You Want Add An Attachment Below?**', components: [row_first] });
            const buttonFilter = (button) => this.buttonCommands.includes(button.customId) && button.user.id === interaction.user.id;

            const collector = await message.awaitMessageComponent({ filter: buttonFilter, time: 20000, componentType: 'BUTTON' });
            const { customId, value } = buttonOptions.find(button => button.customId === collector.customId);

            const updated_row_first = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('selected_decision')
                        .setEmoji(value)
                        .setStyle(customId === 'yes' ? 'SUCCESS' : 'DANGER')
                        .setDisabled()
                );

            await collector.update({ components: [updated_row_first] });

            if (customId === 'yes') {
                await interaction.followUp('**Please Enter An Attachment Below!**');
                const attachmentFilter = (msg) => msg.author.id === interaction.user.id && msg.attachments.size > 0;
                const messageCollector = await interaction.channel.awaitMessages({ filter: attachmentFilter, time: 30000, max: 1 });

                if (messageCollector.size < 1) {
                    return interaction.editReply(`**No Attachments Submitted**`);
                };

                const embed = new MessageEmbed()
                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                    .setColor('GREEN')
                    .setImage(messageCollector.first().attachments.first().url)
                    .setTimestamp();

                if (content) embed.setDescription(content);
                await channel.send({ embeds: [embed] });
            } else {
                const embed = new MessageEmbed()
                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                    .setColor('GREEN')
                    .setDescription(content)
                    .setTimestamp();
                await channel.send({ embeds: [embed] });
            };
            return interaction.editReply(`**Embed Sent In ${channel}**`);
        } catch (error) {
            if (error.code === 'INTERACTION_COLLECTOR_ERROR') {
                return interaction.editReply({ content: '**Timeout**', components: [] });
            } else {
                console.error(error);
                return interaction.editReply(`An Error Occured: \`${error.message}\`!`);
            };
        };
    };
};