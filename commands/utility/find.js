const { MessageEmbed, Collection } = require('discord.js');
const Command = require('../../structures/Command');

module.exports = class Find extends Command {
    constructor(...args) {
        super(...args, {
            name: 'find',
            aliases: [],
            category: 'general',
            description: 'Adds You To Team',
            usage: '[rank (+r, -r) | amongus (+au, -au) | battleprime (+bp, -bp) | valorant (+v, -v)]',
            accessableby: 'everyone'
        });
    };
    async run(message, args) {
        if (!args[0]) return message.channel.send(`**Please Enter Game Name To Find Party!**`);
        const channel = message.guild.channels.cache.get('751660887600922704');
        if (!channel) return message.channel.send(`**Find Channel Not Found!**`);
        if (message.channel.id !== channel.id) return message.channel.send(`**To Find A Party For Any Game, Use <#${channel.id}>**`);

        try {
            if (args[0].toLowerCase() === 'rank') {
                const games = this.bot.games.get('rank');
                if (games) {
                    message.channel.send(`**Rank Searching Is Currently Going On!**`);
                } else {
                    this.bot.games.set('rank', {
                        name: 'rank',
                        data: {
                            players: new Collection(),
                            channel: message.channel.id
                        }
                    });
                };
                const { players } = this.bot.games.get('rank').data;
                players.set(message.author.id, {
                    playing: true,
                    hasStarted: true
                });

                const startEmbed = new MessageEmbed()
                    .setTitle('5v5 Rank')
                    .setColor('GREEN')
                    .setDescription(`**${message.member.displayName} Wants To Rank!**\n\n__Current No. Of People Who Want To Rank!__ - \`${players.size}/${5}\``)
                    .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                    .setTimestamp();
                message.channel.send({ embed: startEmbed });

                const filter = (user) => {
                    if (user.author.bot) return false;
                    if (user.content.toLowerCase() === '+r' || user.content.toLowerCase() === '-r') return true;
                };

                const collector = message.channel.createMessageCollector(filter, {
                    time: 600000
                });

                collector.on('collect', async (collected) => {
                    const member = message.guild.members.cache.get(collected.author.id);

                    if (players.has(member.user.id) && collected.content.toLowerCase() === '-r') {
                        players.delete(member.user.id);
                        if (players.size !== 0) {
                            const leftEmbed = new MessageEmbed()
                                .setAuthor(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
                                .setTitle('5v5 Rank')
                                .setColor('GREEN')
                                .setDescription(`**${member.displayName} Has Left The Rank Party**\n\n__Current No. Of People Who Want To Rank!__ - \`${players.size}/${5}\``)
                                .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                                .setTimestamp();
                            return message.channel.send({ embed: leftEmbed });
                        } else {
                            this.bot.games.delete('rank');
                            return collector.stop('stopped');
                        };
                    } else if (!players.has(member.user.id) && collected.content.toLowerCase() === '-r') {
                        return message.channel.send(`**You Cannot Leave Party As You Haven't Joined It Yet!**`);
                    } else if (players.has(member.user.id) && collected.content.toLowerCase() === '+r') {
                        return message.channel.send(`**You Have Already Joined The Party!**`);
                    } else {
                        players.set(member.user.id, {
                            playing: true,
                            hasStarted: false
                        });

                        const joinedEmbed = new MessageEmbed()
                            .setAuthor(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('5v5 Rank')
                            .setColor('GREEN')
                            .setDescription(`**${member.displayName} Has Joined The Rank Party**\n\n__Current No. Of People Who Want To Rank!__ - \`${players.size}/${5}\``)
                            .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTimestamp();
                        message.channel.send({ embed: joinedEmbed });
                    };

                    if (players.size === 5) collector.stop('full');
                });

                collector.on('end', async (collected, reason) => {
                    let lineup = ``;
                    for (const item of players.keys()) lineup += `> <@${item}>\n`

                    if (reason === 'full') {
                        const fullEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('5v5 Rank')
                            .setColor('GREEN')
                            .addField('Lineup', lineup)
                            .setFooter('Rank Matching Completed')
                            .setTimestamp();

                        for (const id of players.keys()) {
                            let user = this.bot.users.cache.get(id);
                            players.delete(id);
                            try {
                                await user.send({ embed: fullEmbed });
                            } catch (error) {
                                message.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                            };
                        };
                        this.bot.games.delete('rank');
                        return message.channel.send(`**Rank Players Found! Lineup Has Been DMed To All Players!**`, { embed: fullEmbed });
                    } else if (reason === 'stopped') {
                        const stopEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('5v5 Rank')
                            .setColor('GREEN')
                            .setDescription(`**Rank Cancelled No Players Found!**`)
                            .setFooter('Rank Matching Stopped')
                            .setTimestamp();
                        return message.channel.send({ embed: stopEmbed })
                    } else {
                        this.bot.games.delete('rank');
                        const failedEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('5v5 Rank')
                            .setColor('GREEN')
                            .setDescription('**Failed To Find Full Party, Current Lineup Is**')
                            .addField('Lineup', lineup)
                            .setFooter('Full Party Unavailable')
                            .setTimestamp();

                        for (const id of players.keys()) {
                            let user = this.bot.users.cache.get(id);
                            players.delete(id);
                            try {
                                await user.send({ embed: failedEmbed });
                            } catch (error) {
                                message.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                            };
                        };
                        return message.channel.send(`**Rank Searching Completed! Lineup Has Been DMed To All Players Currently In Party!**`, { embed: failedEmbed });
                    };
                });
            } else if (args[0].toLowerCase() === 'amongus') {
                const games = this.bot.games.get('amongus');
                if (games) {
                    message.channel.send(`**Currently Searching Players For Among Us!**`);
                } else {
                    this.bot.games.set('amongus', {
                        name: 'amongus',
                        data: {
                            players: new Collection(),
                            channel: message.channel.id
                        }
                    });
                };
                const { players } = this.bot.games.get('amongus').data;
                players.set(message.author.id, {
                    playing: true,
                    hasStarted: true
                });

                const startEmbed = new MessageEmbed()
                    .setTitle('Among Us')
                    .setColor('GREEN')
                    .setDescription(`**${message.member.displayName} Wants To Play Among Us!**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${10}\``)
                    .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                    .setTimestamp();
                message.channel.send({ embed: startEmbed });

                const filter = (user) => {
                    if (user.author.this.bot) return false;
                    if (user.content.toLowerCase() === '+au' || user.content.toLowerCase() === '-au') return true;
                };

                const collector = message.channel.createMessageCollector(filter, {
                    time: 600000
                });

                collector.on('collect', async (collected) => {
                    const member = message.guild.members.cache.get(collected.author.id);

                    if (players.has(member.user.id) && collected.content.toLowerCase() === '-au') {
                        players.delete(member.user.id);
                        if (players.size !== 0) {
                            const leftEmbed = new MessageEmbed()
                                .setAuthor(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
                                .setTitle('Among Us')
                                .setColor('GREEN')
                                .setDescription(`**${member.displayName} Has Left The Among Us Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${10}\``)
                                .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                                .setTimestamp();
                            return message.channel.send({ embed: leftEmbed });
                        } else {
                            this.bot.games.delete('amongus');
                            return collector.stop('stopped');
                        };
                    } else if (!players.has(member.user.id) && collected.content.toLowerCase() === '-au') {
                        return message.channel.send(`**You Cannot Leave Party As You Haven't Joined It Yet!**`);
                    } else if (players.has(member.user.id) && collected.content.toLowerCase() === '+au') {
                        return message.channel.send(`**You Have Already Joined The Party!**`);
                    } else {
                        players.set(member.user.id, {
                            playing: true,
                            hasStarted: false
                        });

                        const joinedEmbed = new MessageEmbed()
                            .setAuthor(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Among Us')
                            .setColor('GREEN')
                            .setDescription(`**${member.displayName} Has Joined The Among Us Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${10}\``)
                            .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTimestamp();
                        message.channel.send({ embed: joinedEmbed });
                    };

                    if (players.size === 10) collector.stop('full');
                });

                collector.on('end', async (collected, reason) => {
                    let lineup = ``;
                    for (const item of players.keys()) lineup += `> <@${item}>\n`

                    if (reason === 'full') {
                        const fullEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('Among Us')
                            .setColor('GREEN')
                            .addField('Lineup', lineup)
                            .setFooter('Party Searching Completed')
                            .setTimestamp();

                        for (const id of players.keys()) {
                            let user = this.bot.users.cache.get(id);
                            players.delete(id);
                            try {
                                await user.send({ embed: fullEmbed });
                            } catch (error) {
                                message.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                            };
                        };
                        this.bot.games.delete('amongus');
                        return message.channel.send(`**Among Us Players Found! Lineup Has Been DMed To All Players!**`, { embed: fullEmbed });
                    } else if (reason === 'stopped') {
                        const stopEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('Among Us')
                            .setColor('GREEN')
                            .setDescription(`**Searching Cancelled No Players Found!**`)
                            .setFooter('Among Us Party Searching Stopped')
                            .setTimestamp();
                        return message.channel.send({ embed: stopEmbed })
                    } else {
                        this.bot.games.delete('amongus');
                        const failedEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('Among Us')
                            .setColor('GREEN')
                            .setDescription('**Failed To Find Full Party, Current Lineup Is**')
                            .addField('Lineup', lineup)
                            .setFooter('Full Party Unavailable')
                            .setTimestamp();

                        for (const id of players.keys()) {
                            let user = this.bot.users.cache.get(id);
                            players.delete(id);
                            try {
                                await user.send({ embed: failedEmbed });
                            } catch (error) {
                                message.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                            };
                        };
                        return message.channel.send(`**Party Searching Completed! Lineup Has Been DMed To All Players Currently In Party!**`, { embed: failedEmbed });
                    };
                });
            } else if (args[0].toLowerCase() === 'battleprime') {
                const games = this.bot.games.get('battleprime');
                if (games) {
                    message.channel.send(`**Currently Searching Players For Battle Prime!**`);
                } else {
                    this.bot.games.set('battleprime', {
                        name: 'battleprime',
                        data: {
                            players: new Collection(),
                            channel: message.channel.id
                        }
                    });
                };
                const { players } = this.bot.games.get('battleprime').data;
                players.set(message.author.id, {
                    playing: true,
                    hasStarted: true
                });

                const startEmbed = new MessageEmbed()
                    .setTitle('Battle Prime')
                    .setColor('GREEN')
                    .setDescription(`**${message.member.displayName} Wants To Play Battle Prime!**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${3}\``)
                    .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                    .setTimestamp();
                message.channel.send({ embed: startEmbed });

                const filter = (user) => {
                    if (user.author.bot) return false;
                    if (user.content.toLowerCase() === '+bp' || user.content.toLowerCase() === '-bp') return true;
                };

                const collector = message.channel.createMessageCollector(filter, {
                    time: 600000
                });

                collector.on('collect', async (collected) => {
                    const member = message.guild.members.cache.get(collected.author.id);

                    if (players.has(member.user.id) && collected.content.toLowerCase() === '-bp') {
                        players.delete(member.user.id);
                        if (players.size !== 0) {
                            const leftEmbed = new MessageEmbed()
                                .setAuthor(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
                                .setTitle('Battle Prime')
                                .setColor('GREEN')
                                .setDescription(`**${member.displayName} Has Left The Battle Prime Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${3}\``)
                                .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                                .setTimestamp();
                            return message.channel.send({ embed: leftEmbed });
                        } else {
                            this.bot.games.delete('battleprime');
                            return collector.stop('stopped');
                        };
                    } else if (!players.has(member.user.id) && collected.content.toLowerCase() === '-bp') {
                        return message.channel.send(`**You Cannot Leave Party As You Haven't Joined It Yet!**`);
                    } else if (players.has(member.user.id) && collected.content.toLowerCase() === '+bp') {
                        return message.channel.send(`**You Have Already Joined The Party!**`);
                    } else {
                        players.set(member.user.id, {
                            playing: true,
                            hasStarted: false
                        });

                        const joinedEmbed = new MessageEmbed()
                            .setAuthor(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Battle Prime')
                            .setColor('GREEN')
                            .setDescription(`**${member.displayName} Has Joined The Battle Prime Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${3}\``)
                            .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTimestamp();
                        message.channel.send({ embed: joinedEmbed });
                    };

                    if (players.size === 3) collector.stop('full');
                });

                collector.on('end', async (collected, reason) => {
                    let lineup = ``;
                    for (const item of players.keys()) lineup += `> <@${item}>\n`

                    if (reason === 'full') {
                        const fullEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('Battle Prime')
                            .setColor('GREEN')
                            .addField('Lineup', lineup)
                            .setFooter('Party Searching Completed')
                            .setTimestamp();

                        for (const id of players.keys()) {
                            let user = this.bot.users.cache.get(id);
                            players.delete(id);
                            try {
                                await user.send({ embed: fullEmbed });
                            } catch (error) {
                                message.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                            };
                        };
                        this.bot.games.delete('battleprime');
                        return message.channel.send(`**Among Us Players Found! Lineup Has Been DMed To All Players!**`, { embed: fullEmbed });
                    } else if (reason === 'stopped') {
                        const stopEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('Battle Prime')
                            .setColor('GREEN')
                            .setDescription(`**Searching Cancelled No Players Found!**`)
                            .setFooter('Battle Prime Party Searching Stopped')
                            .setTimestamp();
                        return message.channel.send({ embed: stopEmbed })
                    } else {
                        this.bot.games.delete('battleprime');
                        const failedEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('Battle Prime')
                            .setColor('GREEN')
                            .setDescription('**Failed To Find Full Party, Current Lineup Is**')
                            .addField('Lineup', lineup)
                            .setFooter('Full Party Unavailable')
                            .setTimestamp();

                        for (const id of players.keys()) {
                            let user = this.bot.users.cache.get(id);
                            players.delete(id);
                            try {
                                await user.send({ embed: failedEmbed });
                            } catch (error) {
                                message.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                            };
                        };
                        return message.channel.send(`**Party Searching Completed! Lineup Has Been DMed To All Players Currently In Party!**`, { embed: failedEmbed });
                    };
                });
            } else if (args[0].toLowerCase() === 'valorant') {
                const games = this.bot.games.get('valorant');
                if (games) {
                    message.channel.send(`**Currently Searching Players For Valorant!**`);
                } else {
                    this.bot.games.set('valorant', {
                        name: 'valorant',
                        data: {
                            players: new Collection(),
                            channel: message.channel.id
                        }
                    });
                };
                const { players } = this.bot.games.get('valorant').data;
                players.set(message.author.id, {
                    playing: true,
                    hasStarted: true
                });

                const startEmbed = new MessageEmbed()
                    .setTitle('Valorant')
                    .setColor('GREEN')
                    .setDescription(`**${message.member.displayName} Wants To Play Valorant!**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${5}\``)
                    .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                    .setTimestamp();
                message.channel.send({ embed: startEmbed });

                const filter = (user) => {
                    if (user.author.bot) return false;
                    if (user.content.toLowerCase() === '+v' || user.content.toLowerCase() === '-v') return true;
                };

                const collector = message.channel.createMessageCollector(filter, {
                    time: 600000
                });

                collector.on('collect', async (collected) => {
                    const member = message.guild.members.cache.get(collected.author.id);

                    if (players.has(member.user.id) && collected.content.toLowerCase() === '-v') {
                        players.delete(member.user.id);
                        if (players.size !== 0) {
                            const leftEmbed = new MessageEmbed()
                                .setAuthor(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
                                .setTitle('Valorant')
                                .setColor('GREEN')
                                .setDescription(`**${member.displayName} Has Left The Valorant Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${5}\``)
                                .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                                .setTimestamp();
                            return message.channel.send({ embed: leftEmbed });
                        } else {
                            this.bot.games.delete('valorant');
                            return collector.stop('stopped');
                        };
                    } else if (!players.has(member.user.id) && collected.content.toLowerCase() === '-v') {
                        return message.channel.send(`**You Cannot Leave Party As You Haven't Joined It Yet!**`);
                    } else if (players.has(member.user.id) && collected.content.toLowerCase() === '+v') {
                        return message.channel.send(`**You Have Already Joined The Party!**`);
                    } else {
                        players.set(member.user.id, {
                            playing: true,
                            hasStarted: false
                        });

                        const joinedEmbed = new MessageEmbed()
                            .setAuthor(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('Valorant')
                            .setColor('GREEN')
                            .setDescription(`**${member.displayName} Has Joined The Valorant Party**\n\n__Current No. Of People Who Want To Play!__ - \`${players.size}/${5}\``)
                            .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTimestamp();
                        message.channel.send({ embed: joinedEmbed });
                    };

                    if (players.size === 5) collector.stop('full');
                });

                collector.on('end', async (collected, reason) => {
                    let lineup = ``;
                    for (const item of players.keys()) lineup += `> <@${item}>\n`

                    if (reason === 'full') {
                        const fullEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('Valorant')
                            .setColor('GREEN')
                            .addField('Lineup', lineup)
                            .setFooter('Party Searching Completed')
                            .setTimestamp();

                        for (const id of players.keys()) {
                            let user = this.bot.users.cache.get(id);
                            players.delete(id);
                            try {
                                await user.send({ embed: fullEmbed });
                            } catch (error) {
                                message.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                            };
                        };
                        this.bot.games.delete('valorant');
                        return message.channel.send(`**Among Us Players Found! Lineup Has Been DMed To All Players!**`, { embed: fullEmbed });
                    } else if (reason === 'stopped') {
                        const stopEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('Valorant')
                            .setColor('GREEN')
                            .setDescription(`**Searching Cancelled No Players Found!**`)
                            .setFooter('Valorant Party Searching Stopped')
                            .setTimestamp();
                        return message.channel.send({ embed: stopEmbed })
                    } else {
                        this.bot.games.delete('valorant');
                        const failedEmbed = new MessageEmbed()
                            .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTitle('Valorant')
                            .setColor('GREEN')
                            .setDescription('**Failed To Find Full Party, Current Lineup Is**')
                            .addField('Lineup', lineup)
                            .setFooter('Full Party Unavailable')
                            .setTimestamp();

                        for (const id of players.keys()) {
                            let user = this.bot.users.cache.get(id);
                            players.delete(id);
                            try {
                                await user.send({ embed: failedEmbed });
                            } catch (error) {
                                message.channel.send(`**Lineup Was Not Send To ${user} As His/Her DMs Are Blocked!**`);
                            };
                        };
                        return message.channel.send(`**Party Searching Completed! Lineup Has Been DMed To All Players Currently In Party!**`, { embed: failedEmbed });
                    };
                });
            } else {
                return message.channel.send(`**Please Enter The Right Format!\n\n+find [rank | battleprime | amongus | valorant]**`);
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    }
};