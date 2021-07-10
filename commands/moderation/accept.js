const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');
const Applicants = require('../../structures/models/applicants');

module.exports = class Accept extends Command {
    constructor(...args) {
        super(...args, {
            name: 'accept',
            aliases: ['acc'],
            category: 'moderation',
            description: 'Accepts The Tryout Applicant',
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
            const applicant = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(r => r.user.username.toLowerCase() === args.join(' ').toLowerCase());
            if (!applicant) return message.channel.send('**Applicant Not Found, Please Enter A Valid Name!**');

            let Applicant = await Applicants.findOne({
                ApplicantID: applicant.user.id
            });
            if (!Applicant) return message.channel.send(`**This Person Has Not Applied For HOPE!**`);

            const clanMemberRole = message.guild.roles.cache.get('724538190861434900');
            if (!clanMemberRole) return message.channel.send(`**Error: Clan Member Role Not Found!**`);
            const tryoutRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'tryouts');

            if (tryoutRole && applicant.roles.cache.has(tryoutRole.id)) await applicant.roles.remove(tryoutRole.id);
            await applicant.roles.add(clanMemberRole.id);

            const embed = new MessageEmbed()
                .setAuthor(applicant.user.username, applicant.user.displayAvatarURL({ dynamic: true }))
                .setTitle('You Have Been Accepted To HOPE')
                .setColor('GREEN')
                .setDescription(`**Hi ${applicant}! Welcome To HOPE UPRISING. We Are Happy To Have You In The Team :tada:. I'd Suggest You To Please Go Through The  <#742863411758497812> To Get To Know How Things Run On A Day-To-Day Basis In This Clan :thumbsup:!**`)
                .setImage('https://cdn.discordapp.com/attachments/724541103008776232/745967858315690085/Hope_Logo.gif')
                .setFooter(`Accepted To Clan By ${message.author.username}`)
                .setTimestamp();
            try {
                await Applicants.deleteOne({
                    ApplicantID: applicant.user.id
                });
            } catch (error) {
                console.error(error);
                return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
            };
            try {
                await applicant.send({ embed: embed });
            } catch (error) {
                return message.channel.send(`**Applicant's DMs Are Blocked!\nCouldn't Send Accepted Embed To The Applicant!**`);
            };
            return message.channel.send(`Message Has Been Sent To ${applicant.user.username}`);
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};
