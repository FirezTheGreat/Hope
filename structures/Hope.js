const { Client, Collection } = require('discord.js');
const Util = require('./Util');

module.exports = class Hope extends Client {
    constructor(options = {
        owners: []
    }) {
        super({
            partials: ['MESSAGE', 'REACTION'],
            presence: {
                status: 'online',
                activities: [
                    { name: 'Hope', type: 'WATCHING' }
                ]
            },
            intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES']
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