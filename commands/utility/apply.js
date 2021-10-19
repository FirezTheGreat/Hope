const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { lockedAt } = require('../../structures/functions');
const Command = require('../../structures/Command');
const Applicants = require('../../structures/models/ApplicantList');
const buttonOptions = [
    { customId: 'yes', value: '✅' }, { customId: 'no', value: 'cz_cross:590234470221742146' }
];

module.exports = class Apply extends Command {
    constructor(...args) {
        super(...args, {
            name: 'apply',
            category: 'utility',
            description: 'Apply For HOPE!',
            usage: '',
            accessableby: 'Everyone',
            slashCommand: true,
            commandOptions: [
                { name: 'reason', type: 'STRING', description: 'Reason for AFK', required: false }
            ],
            buttonCommands: ['yes', 'no']
        });
    };
    async interactionRun(interaction) {
        const role = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'hutiya');
        if (!role) return interaction.editReply('**Role Not Found - Tryouts**');

        try {
            await interaction.deferReply();

            let applicant = await Applicants.findOne({ ApplicantID: interaction.user.id });
            if (applicant) return interaction.editReply(`You Have Already Applied For HOPE on ${applicant.SubmitDate}`);

            applicant = await Applicants.create({
                ApplicantID: interaction.user.id,
                SubmitDate: lockedAt()
            });
            await applicant.save();

            const embed = new MessageEmbed()
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                .setColor('GREEN')
                .setDescription('Application Started In Your Dms!')
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });

            const dmEmbed = new MessageEmbed()
                .setTitle('Application Started')
                .setDescription('Application Started - Type \`cancel\` to cancel the application')
                .setColor('GREEN')
                .setFooter('HOPE UPRISING Tryout Form')
                .setTimestamp();

            try {
                await interaction.user.send({ embeds: [dmEmbed] });
            } catch (error) {
                await Applicants.deleteOne({ ApplicantID: interaction.user.id });
                return interaction.editReply('Cannot Continue Application! Your DMs Are Blocked!');
            };

            const confirmEmbed = new MessageEmbed()
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                .setColor('GREEN')
                .setDescription(`**To apply for HOPE you must have**
:large_blue_diamond: Master or above Rank
:large_blue_diamond: Your age should be 15 and above
:large_blue_diamond: KDR of 1.0 or above

**Do you have the following requirements?**
`)
                .setFooter('React To Continue or Discontinue The Application')
                .setTimestamp();

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

            const message = await interaction.user.send({ embeds: [confirmEmbed], components: [row_first] });
            const buttonFilter = (button) => this.buttonCommands.includes(button.customId) && button.user.id === interaction.user.id;

            const firstCollector = await message.awaitMessageComponent({ filter: buttonFilter, time: 60000, componentType: 'BUTTON' });
            const { customId, value } = buttonOptions.find(button => button.customId === firstCollector.customId);

            const updated_row_first = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('selected_decision')
                        .setEmoji(value)
                        .setStyle(customId === 'yes' ? 'SUCCESS' : 'DANGER')
                        .setDisabled()
                );

            await firstCollector.update({ components: [updated_row_first] });

            if (customId === 'no') {
                interaction.user.send('**Application Cancelled!**');
                return await Applicants.deleteOne({ ApplicantID: interaction.user.id });
            };

            const filter = msg => msg.author.id === interaction.user.id;
            const collector = interaction.user.dmChannel.createMessageCollector({ filter: filter, max: 6, time: 300000 });

            const startEmbed = new MessageEmbed()
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                .setTitle('Question 1')
                .setColor('GREEN')
                .setDescription(`${interaction.user} Please Enter Your Real Name`)
                .setFooter('Question 1/6')
                .setTimestamp();
            interaction.user.send({ embeds: [startEmbed] });
            let currentStep = 0;

            collector.on('collect', async (collected) => {
                try {
                    if (collected.content.toLowerCase() === 'cancel') {
                        collector.stop('cancelled');
                        await Applicants.deleteOne({ ApplicantID: interaction.user.id });
                        return;
                    };
                    if (currentStep === currentStep) currentStep = currentStep + 1;
                    if (currentStep === 1) {
                        const embed = new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Question 2')
                            .setColor('GREEN')
                            .setDescription(`${interaction.user} Enter Your Age`)
                            .setFooter('Question 2/6')
                            .setTimestamp();
                        interaction.user.send({ embeds: [embed] });
                    };
                    if (currentStep === 2) {
                        const embed = new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Question 3')
                            .setColor('GREEN')
                            .setDescription(`${interaction.user} Please Enter Your Previous Clans`)
                            .setFooter('Question 3/6')
                            .setTimestamp();
                        interaction.user.send({ embeds: [embed] });
                    };
                    if (currentStep === 3) {
                        const embed = new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Question 4')
                            .setColor('GREEN')
                            .setDescription(`${interaction.user} Why Do You Want To Join Hope?`)
                            .setFooter('Question 4/6')
                            .setTimestamp();
                        interaction.user.send({ embeds: [embed] })
                    };
                    if (currentStep === 4) {
                        const embed = new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Question 5')
                            .setColor('GREEN')
                            .setDescription(`Which device do you use and what FPS do you get?`)
                            .setFooter('Question 5/6')
                            .setTimestamp();
                        interaction.user.send({ embeds: [embed] })
                    };
                    if (currentStep === 5) {
                        const embed = new MessageEmbed()
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Question 6')
                            .setColor('GREEN')
                            .setDescription(`${interaction.user} Please Upload A Screenshot Of Your Profile`)
                            .setFooter('Question 6/6')
                            .setTimestamp();
                        interaction.user.send({ embeds: [embed] })
                    };
                    if (currentStep === 6 && collected.attachments.size <= 0) {
                        collector.stop('no attachments');
                        await Applicants.deleteOne({ ApplicantID: interaction.user.id });
                        return;
                    };
                } catch (error) {
                    await Applicants.deleteOne({ ApplicantID: interaction.user.id });
                    if (interaction.member.roles.cache.has(role.id)) interaction.member.roles.remove(role.id);

                    if (error.code === 'INTERACTION_COLLECTOR_ERROR') {
                        return interaction.editReply({ content: '**Application Cancelled Due To Inactivity!**', components: [] });
                    } else {
                        console.error(error);
                        return interaction.editReply(`An Error Occured: \`${error.message}\`!`);
                    };
                };
            });

            collector.on('end', async (collected, reason) => {
                try {
                    if (reason.toLowerCase() === 'cancelled') {
                        interaction.user.send(`**Application Cancelled!**`);
                        return await Applicants.deleteOne({
                            ApplicantID: interaction.user.id
                        });
                    };
                    if (reason.toLowerCase() === 'no attachments') {
                        interaction.user.send(`**Application Rejected! No Profile Attachments Attached!**`);
                        return await Applicants.deleteOne({
                            ApplicantID: interaction.user.id
                        });
                    };
                    if (!collected.size) {
                        interaction.user.send('**Application Cancelled Due To Inactivity!**');
                        return await Applicants.deleteOne({
                            ApplicantID: interaction.user.id
                        });
                    };
                    if (collected.size < 6) {
                        interaction.user.send('**Application Cancelled Due To Timeout!**');
                        return await Applicants.deleteOne({
                            ApplicantID: interaction.user.id
                        });
                    };
                    const confirmationEmbed = new MessageEmbed()
                        .setTitle('Submit Application')
                        .setColor('GREEN')
                        .setDescription('Are you sure you wish to apply?')
                        .setFooter('HOPE Tryouts')
                        .setTimestamp();
                    const msg = await interaction.user.send({ embeds: [confirmationEmbed], components: [row_first] });
                    const buttonFilter = (button) => this.buttonCommands.includes(button.customId) && button.user.id === interaction.user.id;

                    const collector = await msg.awaitMessageComponent({ filter: buttonFilter, time: 60000, componentType: 'BUTTON' });
                    const { customId, value } = buttonOptions.find(button => button.customId === collector.customId);

                    const updated_row_second = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('selected_decision')
                                .setEmoji(value)
                                .setStyle(customId === 'yes' ? 'SUCCESS' : 'DANGER')
                                .setDisabled()
                        );

                    await collector.update({ components: [updated_row_second] });

                    if (customId === 'no') {
                        await Applicants.deleteOne({ ApplicantID: interaction.user.id });
                        return interaction.user.send('**Application Cancelled**');
                    } else {
                        collected = collected.map(r => r);

                        const channel = interaction.guild.channels.cache.find(channel => channel.name.toLowerCase() === 'test');
                        const embed = new MessageEmbed()
                            .setAuthor('HOPE Tryout Application', interaction.guild.iconURL({ dynamic: true }))
                            .setColor('GREEN')
                            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: 'Name:-', value: collected[0].content },
                                { name: 'Age:-', value: collected[1].content },
                                { name: 'Previous Clans:-', value: collected[2].content },
                                { name: 'Why Do You Want To Join HOPE:-', value: collected[3].content },
                                { name: 'Which device do you use and what FPS do you get?', value: collected[4].content },
                                { name: 'Date of Application:', value: `${lockedAt()}` },
                                { name: 'Name of Applicant:', value: `${collected[0].author.username}#${collected[0].author.discriminator}` },
                                { name: '\u200b', value: '**Profile Screenshot:-**' }
                            )
                            .setTimestamp();

                        collected[5].attachments.map(r => r.attachment).length !== 0 ? embed.setImage(collected[5].attachments.map(r => r.attachment).toString()) : embed.addField(collected[5].content, '\u200b');
                        interaction.member.roles.add(role.id);
                        await channel.send({ embeds: [embed] });
                        return interaction.user.send('**Application Sent!**')
                    };
                } catch (error) {
                    await Applicants.deleteOne({ ApplicantID: interaction.user.id });
                    if (interaction.member.roles.cache.has(role.id)) interaction.member.roles.remove(role.id);

                    if (error.code === 'INTERACTION_COLLECTOR_ERROR') {
                        return interaction.editReply({ content: '**Application Cancelled Due To Inactivity!**', components: [] });
                    } else {
                        console.error(error);
                        return interaction.editReply(`An Error Occured: \`${error.message}\`!`);
                    };
                };
            });
            return;
        } catch (error) {
            await Applicants.deleteOne({ ApplicantID: interaction.user.id });
            if (interaction.member.roles.cache.has(role.id)) interaction.member.roles.remove(role.id);

            if (error.code === 'INTERACTION_COLLECTOR_ERROR') {
                return interaction.editReply({ content: '**Application Cancelled Due To Inactivity!**', components: [] });
            } else {
                console.error(error);
                return interaction.editReply(`An Error Occured: \`${error.message}\`!`);
            };
        };
    };
};