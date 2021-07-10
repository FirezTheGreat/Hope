const Command = require('../../structures/Command');
const AFK = require('../../structures/models/AFKList');

module.exports = class AwayFromKeyboard extends Command {
    constructor(...args) {
        super(...args, {
            name: 'setafk',
            aliases: ['afk'],
            category: 'general',
            description: 'Sets User As AFK',
            usage: '[reason] (optional)',
            accessableby: 'everyone'
        });
    };
    async run(message, args) {
        try {
            const afk = await AFK.findOne({
                ID: message.author.id
            });
            if (!afk) {
                AFK.create({
                    ID: message.author.id,
                    name: message.author.username,
                    reason: args.join(' ') || 'afk'
                });
                return message.channel.send(`**I Have Set Your AFK\nReason - __${args.join(' ') || 'afk'}__!**`);
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};
