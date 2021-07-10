const Event = require('../../structures/Event');
const AFKList = require('../../structures/models/AFKList');

module.exports = class Message extends Event {
    constructor(...args) {
        super(...args);
    };

    async run(message) {
        try {
            if (!message.guild || message.author.bot || !message.content.startsWith(this.bot.prefix)) return;

            if (message.content.includes(message.mentions.members.first())) {
                let mentioned = await AFKList.findOne({ ID: message.mentions.members.first().id });
                if (mentioned) message.channel.send(`**${mentioned.name} Is Currently AFK\nReason - ${mentioned.reason}!**`);
            };

            let afkcheck = await AFKList.findOne({ ID: message.author.id });
            if (afkcheck) {
                await AFKList.deleteOne({ ID: message.author.id });
                message.channel.send(`**${message.author}, I Have Removed Your AFK Now!**`)
            };

            const [cmd, ...args] = message.content.slice(this.bot.prefix.length).split(/ +/g);

            const command = this.bot.commands.get(cmd.toLowerCase()) || this.bot.commands.get(this.bot.aliases.get(cmd.toLowerCase()));
            if (command) command.run(message, args);
        } catch (err) {
            console.error(err);
        };
    };
};
