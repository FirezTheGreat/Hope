const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');
const Applicants = require('../../structures/models/ApplicantList');

module.exports = class Reject extends Command {
    constructor(...args) {
        super(...args, {
            name: 'reject',
            category: 'moderation',
            description: 'Rejects The Tryout Applicant',
            usage: '[username | ID | mention]',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'applicant', type: 'USER', description: 'Applicant to Accept', required: true },
                { name: 'reason', type: 'STRING', description: 'Reason for Rejection', required: false }
            ]
        });
    };
    async interactionRun(interaction) {
        try {
            const access = interaction.guild.roles.cache.get('859313087030493207');
            if (!access) return interaction.reply('**Role Not Found - Access**!');
            if (!interaction.member.roles.cache.has(access.id) && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply('**You Are Missing Permissions - [ADMINISTRATOR] To Execute This Command**!');

            const member = interaction.options.getMember('applicant');
            if (!member) return interaction.reply('**Applicant Not Found, Please Enter A Valid Name!**');

            const role = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'tryouts');

            const applicant = await Applicants.findOne({ ApplicantID: member.user.id });
            if (!applicant) return interaction.reply(`**This Person Has Not Applied!**`);

            const reason = interaction.options.getString('reason') || 'No Reason Provided';

            Applicants.deleteOne({ ApplicantID: member.user.id }).then(async () => {
                const embed = new MessageEmbed()
                    .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
                    .setTitle('You Have Been Rejected')
                    .setColor('GREEN')
                    .addField('Reason', `\`${reason}\``)
                    .setFooter(`Rejected By ${interaction.user.username}`)
                    .setTimestamp();

                if (role && member.roles.cache.has(role.id)) await member.roles.remove(role.id);
                member.send({ embeds: [embed] }).catch(() => {
                    return interaction.reply(`**Applicant's DMs Are Blocked, Inform The Applicant Personally!**`);
                });
                return interaction.reply(`**Message Has Been Sent To ${member.user.username}**`);
            }).catch((error) => {
                console.error(error);
                return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
            });
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};