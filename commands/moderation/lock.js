const { MessageEmbed } = require('discord.js');
const { lockedAt } = require('../../functions');
const Command = require('../../structures/Command');
const LockedChannels = require('../../structures/models/lockedChannels');

module.exports = class Lock extends Command {
    constructor(...args) {
        super(...args, {
            name: 'lock',
            aliases: ['lock-channel'],
            category: 'moderation',
            description: 'Locks A Channel In The Server',
            usage: '[channel name] <time> (optional)',
            accessableby: 'Administrator or Hope Bot Access'
        });
    };
    async run(message, args) {
        let time;
        try {
            let role = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'hope bot access');
            if (!role) return message.channel.send('**Role Not Found - Hope Bot Access**!');
            if (!message.member.roles.cache.has(role.id) && !message.member.permissions.has('ADMINISTRATOR')) return message.channel.send('**You Are Missing Permissions To Execute This Command**!');

            if (!args[0]) return message.channel.send('**Please Enter A Channel Name or ID**!');

            let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(r => r.name.toLowerCase() === args[0].toLowerCase());
            if (!channel) return message.channel.send('**Please Enter A Valid Channel Name or ID**!');

            let isChannelLocked = await LockedChannels.findOne({ ChannelID: channel.id });
            if (isChannelLocked) return message.channel.send(`**This Channel Is Already Locked\nLocked At: \`${isChannelLocked.lockedAt}\`**`)
            if (channel.type !== 'text') return message.channel.send('**I Can Only Lock Text Channels!**');

            if (!args[1]) return message.channel.send('**Please Give A Timeout!**\nFormat - \`(amount)-sec, (amount)-min, (amount)-hr, (amount)-d\`\nIncorrect Format Will Not Be Accepted!');
            let timeout = args[1].toLowerCase().endsWith('-sec') && (args[1].length > 4) ? args[1].split('-')[0] : args[1].toLowerCase().endsWith('-min') && (args[1].length > 4) ? args[1].split('-')[0] : args[1].toLowerCase().endsWith('-hr') && (args[1].length > 3) ? args[1].split('-')[0] : args[1].toLowerCase().endsWith('-d') && (args[1].length > 1) ? args[1].split('-')[0] : 'return';

            if (timeout === 'return' || !Number(timeout)) return message.channel.send('**This is The Wrong Format!**');
            timeout = args[1].split('-')[1].toLowerCase() === 'sec' ? parseInt(timeout) * 1000 : args[1].split('-')[1].toLowerCase() === 'min' ? parseInt(timeout) * 60 * 1000 : args[1].split('-')[1].toLowerCase() === 'hr' ? parseInt(timeout) * 60 * 60 * 1000 : args[1].split('-')[1].toLowerCase() === 'd' ? parseInt(timeout) * 60 * 60 * 24 * 1000 : parseInt(timeout);

            try {
                await channel.updateOverwrite(message.guild.id, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                });
                const lockedChannel = await LockedChannels.create({
                    ChannelID: channel.id,
                    timeoutInMS: timeout,
                    lockedAt: lockedAt(),
                    user: message.author.id,
                    channel: channel.name
                });
                await lockedChannel.save();

                time = setTimeout(async function () {
                    await channel.updateOverwrite(message.guild.id, {
                        SEND_MESSAGES: null,
                        ADD_REACTIONS: null,
                        READ_MESSAGES: null
                    });
                    const embed = new MessageEmbed()
                        .setColor('GREEN')
                        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                        .setTitle(message.guild.name, message.guild.iconURL())
                        .setDescription(`Successfully Unlocked Channel ${channel.name}!`)
                        .setTimestamp();
                    await message.channel.send({ embed: embed });
                    await LockedChannels.deleteOne({
                        ChannelID: channel.id
                    });
                    return;
                }, timeout);
            } catch (error) {
                clearTimeout(time);
                await LockedChannels.deleteOne({
                    ChannelID: channel.id
                });
                console.error(error);
                return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
            };

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle(message.guild.name, message.guild.iconURL())
                .setDescription(`Successfully Locked Channel ${channel.name}`)
                .setTimestamp();
            await message.channel.send({ embed: embed });

        } catch (error) {
            console.error(error);
            clearTimeout(time);
            await LockedChannels.deleteOne({
                ChannelID: channel.id
            });
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};