const Command = require("../../structures/Command");

module.exports = class Say extends Command {
    constructor(...args) {
        super(...args, {
            name: 'say',
            aliases: ['type', 'announce'],
            description: 'Says A Message',
            category: 'moderation',
            usage: '[channel name] (message)',
            accessableby: 'Administrator or Hope Bot Access'
        });
    };
    async run(message, args) {
        try {
            let role = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'hope bot access');
            if (!role) return message.channel.send('**Role Not Found - Hope Bot Access**!');
            if (!message.member.roles.cache.has(role.id) && !message.member.permissions.has('ADMINISTRATOR')) return message.channel.send('**You Are Missing Permissions To Execute This Command**!');

            if (!args[0]) return message.channel.send('**Please Enter A Channel Name or ID!**');
            let channel = message.mentions.channels.first() || message.guild.channels.cache.find(r => r.name.toLowerCase() === args[0].toLowerCase() && r.type === 'text') || message.guild.channels.cache.get(args[0]);
            if (!channel) return message.channel.send('**Channel Not Found!**');

            let content = args.slice(1).join(' ');

            let attachments = message.attachments;
            if (!content && attachments.size === 0) return message.channel.send('**Please Enter A Message To Announce!**');

            channel.send(content, { files: attachments.map(r => r.attachment) });;
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occured: \`${error.message}\`!`);
        };
    };
};