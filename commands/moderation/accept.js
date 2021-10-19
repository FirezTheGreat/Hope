const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');
const Applicants = require('../../structures/models/ApplicantList');

module.exports = class Accept extends Command {
    constructor(...args) {
        super(...args, {
            name: 'accept',
            category: 'Moderation',
            description: 'Accepts The Tryout Applicant',
            usage: '[username | ID | mention]',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'applicant', type: 'USER', description: 'Applicant to Accept', required: true }
            ]
        });
    };
    async interactionRun(interaction) {
        try {
            const access = interaction.guild.roles.cache.get('859313087030493207');
            if (!access) return interaction.reply('**Role Not Found - Access**!');
            if (!interaction.member.roles.cache.has(access.id) && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply('**You Are Missing Permissions - [ADMINISTRATOR] To Execute This Command**!');

            const applicant = interaction.options.getMember('applicant');
            if (!applicant) return interaction.reply('**Applicant Not Found, Please Enter A Valid Name!**');

            const Applicant = await Applicants.findOne({ ApplicantID: applicant.user.id });
            if (!Applicant) return interaction.reply(`**This Person Has Not Applied!**`);

            const clanMemberRole = interaction.guild.roles.cache.get('724538190861434900');
            const tryoutRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'tryouts');

            if (tryoutRole && applicant.roles.cache.has(tryoutRole.id)) await applicant.roles.remove(tryoutRole.id);
            if (clanMemberRole && !applicant.roles.cache.has(clanMemberRole.id)) await applicant.roles.add(clanMemberRole.id);

            const acceptEmbed = new MessageEmbed()
                .setAuthor(applicant.user.username, applicant.user.displayAvatarURL({ dynamic: true }))
                .setTitle('You Have Been Accepted To HOPE')
                .setColor('GREEN')
                .setDescription(`**Hi ${applicant}! Welcome To HOPE UPRISING. We Are Happy To Have You In The Team :tada:. I'd Suggest You To Please Go Through The  <#742863411758497812> To Get To Know How Things Run On A Day-To-Day Basis In This Clan :thumbsup:!**`)
                .setImage('https://cdn.discordapp.com/attachments/724541103008776232/745967858315690085/Hope_Logo.gif')
                .setFooter(`Accepted In Clan By ${interaction.user.username}`)
                .setTimestamp();
            try {
                await Applicants.deleteOne({ ApplicantID: applicant.user.id });
            } catch (error) {
                console.error(error);
                return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
            };
            try {
                await applicant.send({ embeds: [acceptEmbed] });
            } catch (error) {
                return interaction.reply(`**Applicant's DMs Are Blocked!\nCouldn't Send Accepted Embed To The Applicant!**`);
            };
            return interaction.reply(`Message Has Been Sent To ${applicant.user.username}`);
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};