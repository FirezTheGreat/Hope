const Event = require('../../structures/Event');

module.exports = class extends Event {
	constructor(...args) {
		super(...args, {
			once: true
		});
	};

	run() {
		try {
			this.bot.user.setActivity(`${this.bot.users.cache.size} Members`, { type: 'WATCHING' });
			console.log(`${this.bot.user.username} is Online!`);
			this.bot.erela.connect(this.bot);
			this.bot.music.init(this.bot.user.id);		
		} catch (error) {
			console.error(error);
		};
	};
};