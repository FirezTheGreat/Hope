const Event = require('../../structures/Event');
const AFKList = require('../../structures/models/AFKList');

module.exports = class messageCreate extends Event {
    constructor(...args) {
        super(...args);
    };

    async run(message) {
        try {
            if (!message.guild || message.author.bot || !message.content.startsWith(this.bot.prefix)) return;

            if (message.content.includes(message.mentions.members.size)) {
                for (const [, member] of message.mentions.members) {
                    let mentioned = await AFKList.findOne({ ID: member.id });
                    if (mentioned) message.channel.send(`**${mentioned.name} Is Currently AFK\nReason - ${mentioned.reason}!**`);
                };
            };

            let AFKCheck = await AFKList.findOne({ ID: message.author.id });
            if (AFKCheck) {
                await AFKList.deleteOne({ ID: message.author.id });
                return message.channel.send(`**${message.author}, I Have Removed Your AFK Now!**`);
            };
        } catch (err) {
            console.error(err);
        };
    };
};