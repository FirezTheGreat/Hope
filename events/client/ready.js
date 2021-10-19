const Event = require('../../structures/Event');

module.exports = class Ready extends Event {
    constructor(...args) {
        super(...args, {
            once: true
        });
    };

    async run() {
        try {
            let slashCommands = this.bot.commands.filter(command => command.slashCommand);
            let data = [];

            for (const [key, value] of slashCommands) {
                data.push({ name: key, description: value.description, options: value.commandOptions });
            };

            await this.bot.guilds.cache.get('724509069112639620').commands.set(data);

            this.bot.erela.connect(this.bot);
            this.bot.music.init(this.bot.user.id);

            console.log(`${this.bot.user.username} is Online!`);
        } catch (error) {
            console.error(error);
        };
    };
};