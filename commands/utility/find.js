const { MessageEmbed, Collection } = require('discord.js');
const Command = require('../../structures/Command');

module.exports = class Find extends Command {
    constructor(...args) {
        super(...args, {
            name: 'find',
            category: 'utility',
            description: 'Adds You To Team',
            usage: '[cops | amongus | bgmi | valorant]',
            accessableby: 'Everyone',
            slashCommand: true,
            commandOptions: [
                { name: 'cops', type: 'SUB_COMMAND', description: 'Party to Join or Leave' },
                { name: 'amongus', type: 'SUB_COMMAND', description: 'Party to Join or Leave' },
                { name: 'bgmi', type: 'SUB_COMMAND', description: 'Party to Join or Leave' },
                { name: 'valorant', type: 'SUB_COMMAND', description: 'Party to Join or Leave' }
            ],
        });
    };
    async interactionRun(interaction) {
        const game = interaction.options._subcommand;

        const channel = interaction.guild.channels.cache.get('877051054221570098');
        if (!channel) return interaction.reply(`**Find Channel Not Found!**`);
        if (interaction.channel.id !== channel.id) return interaction.reply(`**To Find A Party For Any Game, Use ${channel}**`);

        try {
            await interaction.deferReply();

            if (game === 'cops') {
                const games = this.bot.games.get('cops');
                if (games) {
                    const { players } = games.data;

                    if (players.has(interaction.user.id)) {
                        if (players.get(interaction.user.id).playing) {
                            players.set(interaction.user.id, { playing: false });

                            if (players.filter(player => player.playing).size <= 0) {
                                clearTimeout(games.timeout);
                                this.bot.games.delete('cops');

                                const stopEmbed = new MessageEmbed()
                                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTitle('5v5 Rank')
                                    .setColor('GREEN')
                                    .setDescription(`**Rank Cancelled All Players Left!**`)
                                    .setFooter('Rank Matching Stopped')
                                    .setTimestamp();
                                return interaction.editReply({ embeds: [stopEmbed] });
                            } else {
                                const leftEmbed = new MessageEmbed()
                                    .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                                    .setTitle('5v5 Rank')
                                    .setColor('GREEN')
                                    .setDescription(`**${interaction.member.displayName} Has Left The Rank Party**\n\n__Current No. Of People Who Want To Rank!__ - \`${players.filter(player => player.playing).size}/${5}\``)
                                    .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTimestamp();
                                return interaction.editReply({ embeds: [leftEmbed] });
                            };
                        } else {
                            players.set(interaction.user.id, { playing: true });

                            const startEmbed = new MessageEmbed()
                                .setTitle('5v5 Rank')
                                .setColor('GREEN')
                                .setDescription(`**${interaction.member.displayName} Rejoins Rank Party!**\n\n__Current No. Of People Who Want To Rank!__ - \`${players.filter(player => player.playing).size}/${5}\``)
                                .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTimestamp();
                            interaction.editReply({ embeds: [startEmbed] });

                            if (players.filter(player => player.playing).size === 5) {
                                let lineup = '';
                                for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                                const fullEmbed = new MessageEmbed()
                                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTitle('5v5 Rank')
                                    .setColor('GREEN')
                                    .addField('Lineup', lineup)
                                    .setFooter('Rank Matching Completed')
                                    .setTimestamp();

                                for (const id of players.filter(player => player.playing).keys()) {
                                    let user = this.bot.users.cache.get(id);
                                    players.delete(id);
                                    try {
                                        await user.send({ embeds: [fullEmbed] });
                                    } catch (error) {
                                        interaction.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                                    };
                                };
                                clearTimeout(games.timeout);
                                this.bot.games.delete('cops');

                                interaction.channel.send({ content: `**Rank Players Found! Lineup Has Been DMed To All Players!**`, embeds: [fullEmbed] });
                            };
                            return;
                        };
                    } else {
                        players.set(interaction.user.id, { playing: true });

                        const joinedEmbed = new MessageEmbed()
                            .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('5v5 Rank')
                            .setColor('GREEN')
                            .setDescription(`**${interaction.member.displayName} Has Joined The Rank Party**\n\n__Current No. Of People Who Want To Rank!__ - \`${players.size}/${5}\``)
                            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                            .setTimestamp();
                        interaction.editReply({ embeds: [joinedEmbed] });

                        if (players.filter(player => player.playing).size === 5) {
                            let lineup = '';
                            for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                            const fullEmbed = new MessageEmbed()
                                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTitle('5v5 Rank')
                                .setColor('GREEN')
                                .addField('Lineup', lineup)
                                .setFooter('Rank Matching Completed')
                                .setTimestamp();

                            for (const id of players.filter(player => player.playing).keys()) {
                                let user = this.bot.users.cache.get(id);
                                players.delete(id);
                                try {
                                    await user.send({ embeds: [fullEmbed] });
                                } catch (error) {
                                    interaction.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                                };
                            };
                            clearTimeout(games.timeout);
                            this.bot.games.delete('cops');

                            interaction.channel.send({ content: `**Rank Players Found! Lineup Has Been DMed To All Players!**`, embeds: [fullEmbed] });
                        };
                        return;
                    };
                } else {
                    this.bot.games.set('cops', {
                        name: 'cops',
                        data: {
                            players: new Collection(),
                            channel: interaction.channel.id
                        },
                        timeout: setTimeout(() => {
                            const { players } = this.bot.games.get('cops').data;

                            let lineup = '';
                            for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                            const failedEmbed = new MessageEmbed()
                                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTitle('5v5 Rank')
                                .setColor('GREEN')
                                .setDescription('**Failed To Find Full Party, Current Lineup Is**')
                                .addField('Lineup', lineup)
                                .setFooter('Full Party Unavailable')
                                .setTimestamp();

                            this.bot.channels.cache.get(this.bot.games.get('cops').data.channel).send({ embeds: [failedEmbed] });
                            this.bot.games.delete('cops');
                        }, 600000)
                    });

                    const { players } = this.bot.games.get('cops').data;
                    players.set(interaction.user.id, { playing: true });

                    const joinedEmbed = new MessageEmbed()
                        .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                        .setTitle('5v5 Rank')
                        .setColor('GREEN')
                        .setDescription(`**${interaction.member.displayName} Has Joined The Rank Party**\n\n__Current No. Of People Who Want To Rank!__ - \`${players.size}/${5}\``)
                        .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                        .setTimestamp();
                    return interaction.editReply({ embeds: [joinedEmbed] });
                };
            } else if (game === 'amongus') {
                const games = this.bot.games.get('amongus');
                if (games) {
                    const { players } = games.data;

                    if (players.has(interaction.user.id)) {
                        if (players.get(interaction.user.id).playing) {
                            players.set(interaction.user.id, { playing: false });

                            if (players.filter(player => player.playing).size <= 0) {
                                clearTimeout(games.timeout);
                                this.bot.games.delete('amongus');

                                const stopEmbed = new MessageEmbed()
                                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTitle('Among Us')
                                    .setColor('GREEN')
                                    .setDescription(`**Searching Cancelled All Players Left!**`)
                                    .setFooter('Among Us Party Searching Stopped')
                                    .setTimestamp();
                                return interaction.editReply({ embeds: [stopEmbed] });
                            } else {
                                const leftEmbed = new MessageEmbed()
                                    .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                                    .setTitle('Among Us')
                                    .setColor('GREEN')
                                    .setDescription(`**${interaction.member.displayName} Has Left The Among Us Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.filter(player => player.playing).size}/${10}\``)
                                    .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTimestamp();
                                return interaction.editReply({ embeds: [leftEmbed] });
                            };
                        } else {
                            players.set(interaction.user.id, { playing: true });

                            const startEmbed = new MessageEmbed()
                                .setTitle('Among Us')
                                .setColor('GREEN')
                                .setDescription(`**${interaction.member.displayName} Rejoins Among Us Party!**\n\n__Current No. Of People Who Want To Play!__ - \`${players.filter(player => player.playing).size}/${10}\``)
                                .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTimestamp();
                            interaction.editReply({ embeds: [startEmbed] });

                            if (players.filter(player => player.playing).size === 10) {
                                let lineup = '';
                                for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                                const fullEmbed = new MessageEmbed()
                                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTitle('Among Us')
                                    .setColor('GREEN')
                                    .addField('Lineup', lineup)
                                    .setFooter('Party Searching Completed')
                                    .setTimestamp();

                                for (const id of players.filter(player => player.playing).keys()) {
                                    let user = this.bot.users.cache.get(id);
                                    players.delete(id);
                                    try {
                                        await user.send({ embeds: [fullEmbed] });
                                    } catch (error) {
                                        interaction.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                                    };
                                };
                                clearTimeout(games.timeout);
                                this.bot.games.delete('amongus');

                                interaction.channel.send({ content: `**Among Us Players Found! Lineup Has Been DMed To All Players!**`, embeds: [fullEmbed] });
                            };
                            return;
                        };
                    } else {
                        players.set(interaction.user.id, { playing: true });

                        const joinedEmbed = new MessageEmbed()
                            .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Among Us')
                            .setColor('GREEN')
                            .setDescription(`**${interaction.member.displayName} Has Joined The Among Us Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.filter(player => player.playing).size}/${10}\``)
                            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                            .setTimestamp();
                        interaction.editReply({ embeds: [joinedEmbed] });

                        if (players.filter(player => player.playing).size === 10) {
                            let lineup = '';
                            for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                            const fullEmbed = new MessageEmbed()
                                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTitle('Among Us')
                                .setColor('GREEN')
                                .addField('Lineup', lineup)
                                .setFooter('Party Searching Completed')
                                .setTimestamp();

                            for (const id of players.filter(player => player.playing).keys()) {
                                let user = this.bot.users.cache.get(id);
                                players.delete(id);
                                try {
                                    await user.send({ embeds: [fullEmbed] });
                                } catch (error) {
                                    interaction.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                                };
                            };
                            clearTimeout(games.timeout);
                            this.bot.games.delete('amongus');

                            interaction.channel.send({ content: `**Among Us Players Found! Lineup Has Been DMed To All Players!**`, embeds: [fullEmbed] });
                        };
                        return;
                    };
                } else {
                    this.bot.games.set('amongus', {
                        name: 'amongus',
                        data: {
                            players: new Collection(),
                            channel: interaction.channel.id
                        },
                        timeout: setTimeout(() => {
                            const { players } = this.bot.games.get('amongus').data;

                            let lineup = '';
                            for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                            const failedEmbed = new MessageEmbed()
                                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTitle('Among Us')
                                .setColor('GREEN')
                                .setDescription('**Failed To Find Full Party, Current Lineup Is**')
                                .addField('Lineup', lineup)
                                .setFooter('Full Party Unavailable')
                                .setTimestamp();

                            this.bot.channels.cache.get(this.bot.games.get('amongus').data.channel).send({ embeds: [failedEmbed] });
                            this.bot.games.delete('amongus');
                        }, 600000)
                    });

                    const { players } = this.bot.games.get('amongus').data;
                    players.set(interaction.user.id, { playing: true });

                    const joinedEmbed = new MessageEmbed()
                        .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                        .setTitle('Among Us')
                        .setColor('GREEN')
                        .setDescription(`**${interaction.member.displayName} Has Joined The Among Us Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.filter(player => player.playing).size}/${10}\``)
                        .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                        .setTimestamp();
                    return interaction.editReply({ embeds: [joinedEmbed] });
                };
            } else if (game === 'bgmi') {
                const games = this.bot.games.get('bgmi');
                if (games) {
                    const { players } = games.data;

                    if (players.has(interaction.user.id)) {
                        if (players.get(interaction.user.id).playing) {
                            players.set(interaction.user.id, { playing: false });

                            if (players.filter(player => player.playing).size <= 0) {
                                clearTimeout(games.timeout);
                                this.bot.games.delete('bgmi');

                                const stopEmbed = new MessageEmbed()
                                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTitle('Battle Prime')
                                    .setColor('GREEN')
                                    .setDescription(`**Searching Cancelled All Players Left!**`)
                                    .setFooter('Battle Prime Party Searching Stopped')
                                    .setTimestamp();
                                return interaction.editReply({ embeds: [stopEmbed] });
                            } else {
                                const leftEmbed = new MessageEmbed()
                                    .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                                    .setTitle('Battle Prime')
                                    .setColor('GREEN')
                                    .setDescription(`**${interaction.member.displayName} Has Left The Battle Prime Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.filter(player => player.playing).size}/${4}\``)
                                    .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTimestamp();
                                return interaction.editReply({ embeds: [leftEmbed] });
                            };
                        } else {
                            players.set(interaction.user.id, { playing: true });

                            const startEmbed = new MessageEmbed()
                                .setTitle('Battle Prime')
                                .setColor('GREEN')
                                .setDescription(`**${interaction.member.displayName} Wants To Play Battle Prime!**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${4}\``)
                                .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTimestamp();
                            interaction.editReply({ embeds: [startEmbed] });

                            if (players.filter(player => player.playing).size === 4) {
                                let lineup = '';
                                for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                                const fullEmbed = new MessageEmbed()
                                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTitle('5v5 Rank')
                                    .setColor('GREEN')
                                    .addField('Lineup', lineup)
                                    .setFooter('Rank Matching Completed')
                                    .setTimestamp();

                                for (const id of players.filter(player => player.playing).keys()) {
                                    let user = this.bot.users.cache.get(id);
                                    players.delete(id);
                                    try {
                                        await user.send({ embeds: [fullEmbed] });
                                    } catch (error) {
                                        interaction.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                                    };
                                };
                                clearTimeout(games.timeout);
                                this.bot.games.delete('bgmi');

                                interaction.channel.send({ content: `**BGMI Players Found! Lineup Has Been DMed To All Players!**`, embeds: [fullEmbed] });
                            };
                            return;
                        };
                    } else {
                        players.set(interaction.user.id, { playing: true });

                        const joinedEmbed = new MessageEmbed()
                            .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Battle Prime')
                            .setColor('GREEN')
                            .setDescription(`**${interaction.member.displayName} Has Joined The Battle Prime Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${4}\``)
                            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                            .setTimestamp();
                        interaction.editReply({ embeds: [joinedEmbed] });

                        if (players.filter(player => player.playing).size === 4) {
                            let lineup = '';
                            for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                            const fullEmbed = new MessageEmbed()
                                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTitle('5v5 Rank')
                                .setColor('GREEN')
                                .addField('Lineup', lineup)
                                .setFooter('Rank Matching Completed')
                                .setTimestamp();

                            for (const id of players.filter(player => player.playing).keys()) {
                                let user = this.bot.users.cache.get(id);
                                players.delete(id);
                                try {
                                    await user.send({ embeds: [fullEmbed] });
                                } catch (error) {
                                    interaction.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                                };
                            };
                            clearTimeout(games.timeout);
                            this.bot.games.delete('bgmi');

                            interaction.channel.send({ content: `**BGMI Players Found! Lineup Has Been DMed To All Players!**`, embeds: [fullEmbed] });
                        };
                        return;
                    };
                } else {
                    this.bot.games.set('bgmi', {
                        name: 'bgmi',
                        data: {
                            players: new Collection(),
                            channel: interaction.channel.id
                        },
                        timeout: setTimeout(() => {
                            const { players } = this.bot.games.get('bgmi').data;

                            let lineup = '';
                            for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                            const failedEmbed = new MessageEmbed()
                                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTitle('5v5 Rank')
                                .setColor('GREEN')
                                .setDescription('**Failed To Find Full Party, Current Lineup Is**')
                                .addField('Lineup', lineup)
                                .setFooter('Full Party Unavailable')
                                .setTimestamp();

                            this.bot.channels.cache.get(this.bot.games.get('bgmi').data.channel).send({ embeds: [failedEmbed] });
                            this.bot.games.delete('bgmi');
                        }, 600000)
                    });

                    const { players } = this.bot.games.get('bgmi').data;
                    players.set(interaction.user.id, { playing: true });

                    const joinedEmbed = new MessageEmbed()
                        .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                        .setTitle('Battle Prime')
                        .setColor('GREEN')
                        .setDescription(`**${interaction.member.displayName} Has Joined The Battle Prime Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${3}\``)
                        .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                        .setTimestamp();
                    return interaction.editReply({ embeds: [joinedEmbed] });
                };
            } else if (game === 'valorant') {
                const games = this.bot.games.get('valorant');
                if (games) {
                    const { players } = games.data;

                    if (players.has(interaction.user.id)) {
                        if (players.get(interaction.user.id).playing) {
                            players.set(interaction.user.id, { playing: false });

                            if (players.filter(player => player.playing).size <= 0) {
                                clearTimeout(games.timeout);
                                this.bot.games.delete('amongus');

                                const stopEmbed = new MessageEmbed()
                                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTitle('Valorant')
                                    .setColor('GREEN')
                                    .setDescription(`**Searching Cancelled No Players Found!**`)
                                    .setFooter('Valorant Party Searching Stopped')
                                    .setTimestamp();
                                return interaction.editReply({ embeds: [stopEmbed] });
                            } else {
                                const leftEmbed = new MessageEmbed()
                                    .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                                    .setTitle('Valorant')
                                    .setColor('GREEN')
                                    .setDescription(`**${interaction.member.displayName} Has Left The Valorant Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.filter(player => player.playing).size}/${5}\``)
                                    .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTimestamp();
                                return interaction.editReply({ embeds: [leftEmbed] });
                            };
                        } else {
                            players.set(interaction.user.id, { playing: true });

                            const startEmbed = new MessageEmbed()
                                .setTitle('Valorant')
                                .setColor('GREEN')
                                .setDescription(`**${interaction.member.displayName} Wants To Play Valorant!**\n\n__Current No. Of People Who Want To Play!__ - \`${players.filter(player => player.playing).size}/${5}\``)
                                .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTimestamp();
                            interaction.editReply({ embeds: [startEmbed] });

                            if (players.filter(player => player.playing).size === 5) {
                                let lineup = '';
                                for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                                const fullEmbed = new MessageEmbed()
                                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                    .setTitle('Valorant')
                                    .setColor('GREEN')
                                    .addField('Lineup', lineup)
                                    .setFooter('Party Searching Completed')
                                    .setTimestamp();

                                for (const id of players.filter(player => player.playing).keys()) {
                                    let user = this.bot.users.cache.get(id);
                                    players.delete(id);
                                    try {
                                        await user.send({ embeds: [fullEmbed] });
                                    } catch (error) {
                                        interaction.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                                    };
                                };
                                clearTimeout(games.timeout);
                                this.bot.games.delete('valorant');

                                interaction.channel.send({ content: `**Valorant Players Found! Lineup Has Been DMed To All Players!**`, embeds: [fullEmbed] });
                            };
                            return;
                        };
                    } else {
                        players.set(interaction.user.id, { playing: true });

                        const joinedEmbed = new MessageEmbed()
                            .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Valorant')
                            .setColor('GREEN')
                            .setDescription(`**${interaction.member.displayName} Has Joined The Valorant Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.filter(player => player.playing).size}/${5}\``)
                            .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                            .setTimestamp();
                        interaction.editReply({ embeds: [joinedEmbed] });

                        if (players.filter(player => player.playing).size === 5) {
                            let lineup = '';
                            for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                            const fullEmbed = new MessageEmbed()
                                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTitle('Valorant')
                                .setColor('GREEN')
                                .addField('Lineup', lineup)
                                .setFooter('Party Searching Completed')
                                .setTimestamp();

                            for (const id of players.filter(player => player.playing).keys()) {
                                let user = this.bot.users.cache.get(id);
                                players.delete(id);
                                try {
                                    await user.send({ embeds: [fullEmbed] });
                                } catch (error) {
                                    interaction.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                                };
                            };
                            clearTimeout(games.timeout);
                            this.bot.games.delete('valorant');

                            interaction.channel.send({ content: `**Valorant Players Found! Lineup Has Been DMed To All Players!**`, embeds: [fullEmbed] });
                        };
                        return;
                    };
                } else {
                    this.bot.games.set('valorant', {
                        name: 'valorant',
                        data: {
                            players: new Collection(),
                            channel: interaction.channel.id
                        },
                        timeout: setTimeout(() => {
                            const { players } = this.bot.games.get('valorant').data;

                            let lineup = '';
                            for (const item of players.filter(player => player.playing).keys()) lineup += `> <@${item}>\n`;

                            const failedEmbed = new MessageEmbed()
                                .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                                .setTitle('Valorant')
                                .setColor('GREEN')
                                .setDescription('**Failed To Find Full Party, Current Lineup Is**')
                                .addField('Lineup', lineup)
                                .setFooter('Full Party Unavailable')
                                .setTimestamp();

                            this.bot.channels.cache.get(this.bot.games.get('valorant').data.channel).send({ embeds: [failedEmbed] });
                            this.bot.games.delete('valorant');
                        }, 600000)
                    });

                    const { players } = this.bot.games.get('valorant').data;
                    players.set(interaction.user.id, { playing: true });

                    const joinedEmbed = new MessageEmbed()
                        .setAuthor(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))
                        .setTitle('Valorant')
                        .setColor('GREEN')
                        .setDescription(`**${interaction.member.displayName} Has Joined The Valorant Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.filter(player => player.playing).size}/${5}\``)
                        .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
                        .setTimestamp();
                    return interaction.editReply({ embeds: [joinedEmbed] });
                };
            };
        } catch (error) {
            console.error(error);
            return interaction.editReply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};