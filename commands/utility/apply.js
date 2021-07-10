const { MessageEmbed } = require('discord.js');
const { lockedAt } = require('../../functions');
const Command = require('../../structures/Command');
const Applicants = require('../../structures/models/applicants');

module.exports = class Apply extends Command {
    constructor(...args) {
        super(...args, {
            name: 'apply',
            aliases: [],
            category: 'general',
            description: 'Apply For HOPE!',
            usage: '',
            accessableby: 'everyone'
        });
    };
    async run(message) {
        const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'tryouts');
        if (!role) return message.channel.send('**Role Not Found - Tryouts**');

        try {
            let applicant = await Applicants.findOne({
                ApplicantID: message.author.id
            });
            if (applicant) return message.channel.send(`You Have Already Applied For HOPE on ${applicant.SubmitDate}`);

            applicant = await Applicants.create({
                ApplicantID: message.author.id,
                SubmitDate: lockedAt()
            });
            await applicant.save();

            let cont = true;
            const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setColor('GREEN')
                .setDescription('Application Started In Your Dms!')
                .setTimestamp();
            await message.channel.send({ embed: embed });
            const dmEmbed = new MessageEmbed()
                .setTitle('Application Started')
                .setDescription('Application Started - Type "+cancel" to cancel the application')
                .setColor('GREEN')
                .setFooter('HOPE UPRISING Tryout Form')
                .setTimestamp();
            try {
                await message.author.send({ embed: dmEmbed });
            } catch (error) {
                await Applicants.deleteOne({
                    ApplicantID: message.author.id
                });
                return message.channel.send('Cannot Continue Application! Your DMs Are Blocked!');
            };

            const confirmEmbed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setColor('GREEN')
                .setDescription(`**To apply for HOPE you must have**
:large_blue_diamond: Master or above Rank
:large_blue_diamond: Your age should be 15 and above
:large_blue_diamond: KDR of 1.0 or above

**Do you have the following requirements?**
`)
                .setFooter('React To Continue or Discontinue The Application')
                .setTimestamp();
            let msg = await message.author.send({ embed: confirmEmbed });

            await msg.react('✅');
            await msg.react('❌');

            const confirmFilter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && (message.author.id === user.id);
            const confirmCollector = await msg.awaitReactions(confirmFilter, {
                max: 1,
                time: 60000
            });
            if (!await confirmCollector.size) {
                message.author.send('**Application Cancelled Due To Inactivity!**');
                return await Applicants.deleteOne({
                    ApplicantID: message.author.id
                });
            };
            if (await confirmCollector.map(r => r._emoji.name).includes('❌')) {
                message.author.send('**Application Cancelled!**');
                return await Applicants.deleteOne({
                    ApplicantID: message.author.id
                });
            };

            const filter = m => m.author.id === message.author.id;
            const collector = message.author.dmChannel.createMessageCollector(filter, {
                max: 6,
                time: 300000
            });

            const startEmbed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle('Question 1')
                .setColor('GREEN')
                .setDescription(`${message.author} Please Enter Your Real Name`)
                .setFooter('Question 1/6')
                .setTimestamp();
            message.author.send({ embed: startEmbed });
            let currentStep = 0;

            collector.on('collect', async (collected) => {
                try {
                    if (collected.content.toLowerCase() === '+cancel') {
                        collector.stop('cancelled');
                        await Applicants.deleteOne({
                            ApplicantID: message.author.id
                        });
                        return;
                    };
                    if (currentStep === currentStep) currentStep = currentStep + 1;
                    if (currentStep === 1) {
                        const embed = new MessageEmbed()
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                            .setTitle('Question 2')
                            .setColor('GREEN')
                            .setDescription(`${message.author} Enter Your Age`)
                            .setFooter('Question 2/6')
                            .setTimestamp();
                        message.author.send({ embed: embed });
                    };
                    if (currentStep === 2) {
                        const embed = new MessageEmbed()
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                            .setTitle('Question 3')
                            .setColor('GREEN')
                            .setDescription(`${message.author} Please Enter Your Previous Clans`)
                            .setFooter('Question 3/6')
                            .setTimestamp();
                        message.author.send({ embed: embed });
                    };
                    if (currentStep === 3) {
                        const embed = new MessageEmbed()
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                            .setTitle('Question 4')
                            .setColor('GREEN')
                            .setDescription(`${message.author} Why Do You Want To Join Hope?`)
                            .setFooter('Question 4/6')
                            .setTimestamp();
                        message.author.send({ embed: embed })
                    };
                    if (currentStep === 4) {
                        const embed = new MessageEmbed()
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                            .setTitle('Question 5')
                            .setColor('GREEN')
                            .setDescription(`Which device do you use and what FPS do you get?`)
                            .setFooter('Question 5/6')
                            .setTimestamp();
                        message.author.send({ embed: embed })
                    };
                    if (currentStep === 5) {
                        const embed = new MessageEmbed()
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                            .setTitle('Question 6')
                            .setColor('GREEN')
                            .setDescription(`${message.author} Please Upload A Screenshot Of Your Profile`)
                            .setFooter('Question 6/6')
                            .setTimestamp();
                        message.author.send({ embed: embed })
                    };
                    if (currentStep === 6 && collected.attachments.size <= 0) {
                        collector.stop('no attachments');
                        await Applicants.deleteOne({
                            ApplicantID: message.author.id
                        });
                        return;
                    };
                } catch (error) {
                    console.error(error);
                    await Applicants.deleteOne({
                        ApplicantID: message.author.id
                    });
                    return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
                };
            });

            collector.on('end', async (collected, reason) => {
                try {
                    if (reason.toLowerCase() === 'cancelled') {
                        message.author.send(`**Application Cancelled!**`);
                        return await Applicants.deleteOne({
                            ApplicantID: message.author.id
                        });
                    };
                    if (reason.toLowerCase() === 'no attachments') {
                        message.author.send(`**Application Rejected! No Profile Attachments Attached!**`);
                        return await Applicants.deleteOne({
                            ApplicantID: message.author.id
                        });
                    };
                    if (!collected.size) {
                        message.author.send('**Application Cancelled Due To Inactivity!**');
                        return await Applicants.deleteOne({
                            ApplicantID: message.author.id
                        });
                    };
                    if (collected.size < 6) {
                        message.author.send('**Application Cancelled Due To Timeout!**');
                        return await Applicants.deleteOne({
                            ApplicantID: message.author.id
                        });
                    };
                    const confirmationEmbed = new MessageEmbed()
                        .setTitle('Submit Application')
                        .setColor('GREEN')
                        .setDescription('Are you sure you wish to apply?')
                        .setFooter('HOPE Tryouts')
                        .setTimestamp();
                    let msg = await message.author.send({ embed: confirmationEmbed });
                    await msg.react('✅');
                    await msg.react('❌');

                    const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && (message.author.id === user.id);
                    const collector = await msg.createReactionCollector(filter, {
                        max: 1,
                        time: 60000
                    });

                    collector.on('collect', async (reaction) => {
                        try {
                            if (reaction.emoji.name === '❌') {
                                cont = false;
                                await Applicants.deleteOne({
                                    ApplicantID: message.author.id
                                });
                                return message.author.send('**Application Cancelled**');
                            };
                            if (reaction.emoji.name === '✅') {
                                message.author.send('**Application Sent!**')
                            };
                        } catch (error) {
                            console.error(error);
                            await Applicants.deleteOne({
                                ApplicantID: message.author.id
                            });
                            return message.author.send(`An Error Occurred: \`${error.message}\`!`);
                        };
                    });

                    collector.on('end', async (collectedReaction) => {
                        if (!collectedReaction.size) {
                            cont = false;
                            await Applicants.deleteOne({
                                ApplicantID: message.author.id
                            });
                            return message.author.send('**Application Cancelled Due To Inactivity!**');
                        };
                        if (!cont) return;
                        collected = collected.map(r => r);
                        const channel = message.guild.channels.cache.find(r => r.name.toLowerCase() === 'tryout-result');
                        const embed = new MessageEmbed()
                            .setAuthor('HOPE Tryout Application', message.guild.iconURL({ dynamic: true }))
                            .setColor('GREEN')
                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: 'Name:-', value: collected[0].content },
                                { name: 'Age:-', value: collected[1].content },
                                { name: 'Previous Clans:-', value: collected[2].content },
                                { name: 'Why Do You Want To Join HOPE:-', value: collected[3].content },
                                { name: 'Which device do you use and what FPS do you get?', value: collected[4].content },
                                { name: 'Date of Application:', value: `${lockedAt()}` },
                                { name: 'Name of Applicant:', value: `${collected[0].author.username}#${collected[0].author.discriminator}` },
                                { name: '\u200b', value: '**Profile Screenshot:-**' }
                            );
                        collected[5].attachments.map(r => r.attachment).length !== 0 ? embed.setImage(collected[5].attachments.map(r => r.attachment).toString()) : embed.addField(collected[5].content, '\u200b');
                        embed.setTimestamp();
                        message.member.roles.add(role.id);
                        return await channel.send({ embed: embed });
                    });
                } catch (error) {
                    console.error(error);
                    await Applicants.deleteOne({
                        ApplicantID: message.author.id
                    });
                    if (message.member.roles.has(role.id)) message.member.roles.remove(role.id);
                    return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
                };
            });
            return;
        } catch (error) {
            console.error(error);
            await Applicants.deleteOne({
                ApplicantID: message.author.id
            });
            if (message.member.roles.has(role.id)) message.member.roles.remove(role.id);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};