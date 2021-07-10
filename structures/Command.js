module.exports = class Command {

	constructor(bot, name, options = {}) {
		this.bot = bot;
		this.name = options.name || name;
		this.aliases = options.aliases || [];
		this.description = options.description || 'No description';
		this.category = options.category;
        this.usage = options.usage;
        this.accessableby = options.accessableby || 'everyone'
	};

	async run(message, args) {
		throw new Error(`Command ${this.name} doesn't provide a run method!`);
	};
};