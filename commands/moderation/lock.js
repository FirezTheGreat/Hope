const { MessageEmbed } = require('discord.js');
const { lockedAt } = require('../../structures/functions');
const Command = require('../../structures/Command');
const LockedChannels = require('../../structures/models/LockedChannelList');

module.exports = class Lock extends Command {
    constructor(...args) {
        super(...args, {
            name: 'lock',
            category: 'moderation',
            description: 'Locks A Channel In The Server',
            usage: '[channel name] <time> (optional)',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'channel', type: 'CHANNEL', description: 'Channel to Lock', required: true },
                { name: 'time', type: 'STRING', description: 'Time to Lock', required: true }
            ]
        });
    };
    async interactionRun(interaction) {
        let finalTime;
        try {
            await interaction.deferReply();

            const access = interaction.guild.roles.cache.get('859313087030493207');
            if (!access) return interaction.editReply('**Role Not Found - Access**!');
            if (!interaction.member.roles.cache.has(access.id) && !interaction.member.permissions.has('MANAGE_GUILD')) return interaction.editReply('**You Are Missing Permissions - [MANAGE_GUILD] To Execute This Command**!');

            const channel = interaction.options.getChannel('channel');
            if (!channel) return interaction.editReply('**Channel Not Found!**');

            let isChannelLocked = await LockedChannels.findOne({ ChannelID: channel.id });
            if (isChannelLocked) return interaction.editReply(`**This Channel Is Already Locked\nLocked At: \`${isChannelLocked.lockedAt}\`**`)
            if (!channel.isText()) return interaction.editReply('**I Can Only Lock Text Channels!**');

            const time = interaction.options.getString('time');
            let timeout = time.toLowerCase().endsWith('-sec') && (time.length > 4) ? time.split('-')[0] : time.toLowerCase().endsWith('-min') && (time.length > 4) ? time.split('-')[0] : time.toLowerCase().endsWith('-hr') && (time.length > 3) ? time.split('-')[0] : time.toLowerCase().endsWith('-d') && (time.length > 1) ? time.split('-')[0] : 'return';

            if (timeout === 'return' || !Number(timeout)) return interaction.editReply('**Please Give A Timeout!\nFormat - \`(amount)-sec, (amount)-min, (amount)-hr, (amount)-d\`\nIncorrect Format Will Not Be Accepted!**');
            timeout = time.split('-')[1].toLowerCase() === 'sec' ? parseInt(timeout) * 1000 : time.split('-')[1].toLowerCase() === 'min' ? parseInt(timeout) * 60 * 1000 : time.split('-')[1].toLowerCase() === 'hr' ? parseInt(timeout) * 60 * 60 * 1000 : time.split('-')[1].toLowerCase() === 'd' ? parseInt(timeout) * 60 * 60 * 24 * 1000 : parseInt(timeout);

            try {
                await channel.permissionOverwrites.edit(interaction.guild.id, {
                    ADD_REACTIONS: false,
                });

                const lockedChannel = await LockedChannels.create({
                    ChannelID: channel.id,
                    timeoutInMS: timeout,
                    lockedAt: lockedAt(),
                    user: interaction.user.id,
                    channel: channel.name
                });
                await lockedChannel.save();

                finalTime = setTimeout(async () => {
                    await channel.permissionOverwrites.edit(interaction.guild.id, {
                        SEND_MESSAGES: true,
                        VIEW_CHANNEL: true
                    });
                    const embed = new MessageEmbed()
                        .setColor('GREEN')
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                        .setTitle(interaction.guild.name, interaction.guild.iconURL())
                        .setDescription(`Successfully Unlocked Channel ${channel.name}!`)
                        .setTimestamp();
                    await interaction.channel.send({ embeds: [embed] });
                    return await LockedChannels.deleteOne({ ChannelID: channel.id });
                }, timeout);
            } catch (error) {
                clearTimeout(finalTime);
                await LockedChannels.deleteOne({ ChannelID: channel.id });
                console.error(error);
                return interaction.editReply(`An Error Occurred: \`${error.message}\`!`);
            };

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                .setTitle(interaction.guild.name, interaction.guild.iconURL())
                .setDescription(`Successfully Locked Channel ${channel.name}`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            clearTimeout(finalTime);
            await LockedChannels.deleteOne({ ChannelID: channel.id });
            return interaction.editReply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};