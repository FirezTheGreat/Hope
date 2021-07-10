const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');
const Applicants = require('../../structures/models/applicants');

module.exports = class Reject extends Command {
    constructor(...args) {
        super(...args, {
            name: 'reject',
            aliases: ['deny'],
            category: 'moderation',
            description: 'Rejects The Tryout Applicant',
            usage: '[username | ID | mention]',
            accessableby: 'Administrators'
        });
    };
    async run(message, args) {
        try {
            const access = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'hope bot access');
            if (!access) return message.channel.send('**Role Not Found - Hope Bot Access**!');
            if (!message.member.roles.cache.has(access.id) && !message.member.permissions.has('ADMINISTRATOR')) return message.channel.send('**You Are Missing Permissions To Execute This Command**!');

            if (!args[0]) return message.channel.send('**Please Enter The Applicant\'s Username or ID To Accept Him!**');
            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'tryouts');
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(r => r.user.username.toLowerCase() === args[0].toLowerCase());
            if (!member) return message.channel.send('**Applicant Not Found, Please Enter A Valid Name!**');

            let applicant = await Applicants.findOne({
                ApplicantID: member.user.id
            });
            if (!applicant) return message.channel.send(`**This Person Has Not Applied For HOPE!**`);

            let reason = args.slice(1).join(' ');
            if (!reason) return message.channel.send(`**Please Enter A Reason To Reject Applicant!**`);

            Applicants.deleteOne({
                ApplicantID: member.user.id
            }).then(() => {
                const embed = new MessageEmbed()
                    .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
                    .setTitle('You Have Been Rejected From HOPE')
                    .setColor('GREEN')
                    .addField('Reason', `\`${reason}\``)
                    .setFooter(`Rejected From Clan By ${message.author.username}`)
                    .setTimestamp();
                if (role && member.roles.cache.has(role.id)) member.roles.remove(role.id);
                member.send({ embed: embed }).catch(() => {
                    if (role && member.roles.cache.has(role.id)) member.roles.remove(role.id);
                    return message.channel.send(`**Applicant's DMs Are Blocked, Inform The Applicant Personally!**`);
                });
                return message.channel.send(`**Message Has Been Sent To ${member.user.username}**`);
            }).catch((error) => {
                console.error(error);
                return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
            });
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};