const { MessageEmbed, Collection } = require('discord.js');
const Command = require('../../structures/Command');
const TotalCount = 5;

module.exports = class Scrim extends Command {
    constructor(...args) {
        super(...args, {
            name: 'scrim',
            aliases: [],
            category: 'general',
            description: 'Adds You To Scrim Team [+sc or -sc to join or leave]',
            usage: '',
            accessableby: 'everyone'
        });
    };
    async run(message) {
        const name = this.bot.commands.get('scrim').config.name;
        const games = this.bot.games.get(name);
        try {
            const role = message.guild.roles.cache.get('724538190861434900');
            if (role && !message.member.roles.cache.has(role.id)) return message.channel.send(`**Scrim Command Is Available Only For Clan Members!**`);

            const channel = message.guild.channels.cache.get('751660887600922704');
            if (!channel) return message.channel.send(`**Scrim Channel Not Found!**`);
            const channel2 = message.guild.channels.cache.get('724541103008776232');
            if (!channel2) return message.channel.send(`**Scrim Channel Not Found!**`);

            if (![channel.id, channel2.id].includes(message.channel.id)) return message.channel.send(`**To Find A Scrim, Use <#${channel.id}> or <#${channel2.id}>**`);
            if (games) {
                message.channel.send(`**Scrim Searching Is Currently Going On!**`);
                return this.bot.games.delete(name);
            } else {
                this.bot.games.set(name, {
                    name: name,
                    data: {
                        players: new Collection(),
                        channel: message.channel.id
                    }
                });
            };
            const { players } = this.bot.games.get(name).data;
            players.set(message.author.id, {
                playing: true,
                hasStarted: true
            });

            const startEmbed = new MessageEmbed()
                .setTitle('5v5 Scrim')
                .setColor('GREEN')
                .setDescription(`**${message.member.displayName} Wants To Scrim!**\n\n__Current No. Of People Who Want To Scrim!__ - \`${players.size}/${TotalCount}\``)
                .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                .setTimestamp();
            message.channel.send({ embed: startEmbed });

            const filter = (user) => {
                if (user.author.bot) return false;
                if (user.content.toLowerCase() === '+sc' || user.content.toLowerCase() === '-sc') {
                    if (role && !user.member.roles.cache.has(role.id)) {
                        message.channel.send(`**Scrim Command Is Available Only For Clan Members!**`);
                        return false;
                    };
                    return true;
                };
            };
            const collector = message.channel.createMessageCollector(filter, {
                time: 600000
            });

            collector.on('collect', async (collected) => {
                const member = message.guild.members.cache.get(collected.author.id);

                if (players.has(member.user.id) && collected.content.toLowerCase() === '-sc') {
                    players.delete(member.user.id);
                    if (players.size !== 0) {
                        const leftEmbed = new MessageEmbed()
                            .setAuthor(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
                            .setTitle('5v5 Scrim')
                            .setColor('GREEN')
                            .setDescription(`**${member.displayName} Has Left The Scrim**\n\n__Current No. Of People Who Want To Scrim!__ - \`${players.size}/${TotalCount}\``)
                            .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
                            .setTimestamp();
                        return message.channel.send({ embed: leftEmbed });
                    } else {
                        this.bot.games.delete(name);
                        return collector.stop('stopped');
                    };
                } else if (!players.has(member.user.id) && collected.content.toLowerCase() === '-sc') {
                    return message.channel.send(`**You Cannot Leave Scrim As You Haven't Joined It Yet!**`);
                } else if (players.has(member.user.id) && collected.content.toLowerCase() === '+sc') {
                    return message.channel.send(`**You Have Already Joined The Scrim!**`);
                } else {
                    players.set(member.user.id, {
                        playing: true,
                        hasStarted: false
                    });

                    const joinedEmbed = new MessageEmbed()
                        .setAuthor(member.displayName, member.user.displayAvatarURL({ dynamic: true }))
                        .setTitle('5v5 Scrim')
                        .setColor('GREEN')
                        .setDescription(`**${member.displayName} Has Joined The Scrim**\n\n__Current No. Of People Who Want To Scrim!__ - \`${players.size}/${TotalCount}\``)
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
                        .setTitle('5v5 Scrim')
                        .setColor('GREEN')
                        .addField('Lineup', lineup)
                        .setFooter('Scrim Matching Completed')
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
                    this.bot.games.delete(name);
                    return message.channel.send(`**Scrim Players Found! Lineup Has Been DMed To All Players!**`, { embed: fullEmbed });
                } else if (reason === 'stopped') {
                    const stopEmbed = new MessageEmbed()
                        .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                        .setTitle('5v5 Scrim')
                        .setColor('GREEN')
                        .setDescription(`**Scrim Cancelled No Players Found!**`)
                        .setFooter('Scrim Matching Stopped')
                        .setTimestamp();
                    return message.channel.send({ embed: stopEmbed })
                } else {
                    this.bot.games.delete(name);
                    const failedEmbed = new MessageEmbed()
                        .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                        .setTitle('5v5 Scrim')
                        .setColor('GREEN')
                        .setDescription('**Failed To Find Full Scrim Party, Current Lineup Is**')
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
                    return message.channel.send(`**Scrim Searching Completed! Lineup Has Been DMed To All Players Currently In Party!**`, { embed: failedEmbed });
                };
            });
        } catch (error) {
            this.bot.games.delete(name);
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    }
};