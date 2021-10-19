module.exports = class Command {

	constructor(bot, name, options = {}) {
		this.bot = bot;
		this.name = options.name || name;
		this.aliases = options.aliases || [];
		this.description = options.description || 'No Description';
		this.category = options.category;
        this.usage = options.usage;
        this.accessableby = options.accessableby || 'Everyone',
        this.slashCommand = options.slashCommand || false;
		this.buttonCommands = options.buttonCommands || [];
		this.commandOptions = options.commandOptions || [];
	};

	async interactionRun(interaction) {
		throw new Error(`Command ${this.name} doesn't provide a interactionRun method!`);
	};
};