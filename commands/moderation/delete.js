const Command = require("../../structures/Command");

module.exports = class Delete extends Command {
    constructor(...args) {
        super(...args, {
            name: "delete",
            aliases: ["purge", "clear"],
            category: "moderation",
            description: "Deletes messages from a channel",
            usage: "delete [amount of messages]",
            accessableby: 'Administrator or Hope Bot Access'
        });
    };
    async run(message, args) {
        try {
            let role = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'hope bot access');
            if (!role) return message.channel.send('**Role Not Found - Hope Bot Access**!');
            if (!message.member.roles.cache.has(role.id) && !message.member.permissions.has('ADMINISTRATOR')) return message.channel.send('**You Are Missing Permissions To Execute This Command**!');

            if (isNaN(args[0]))
                return message.channel.send('**Please Enter A Valid Amount To Delete Messages**');

            if (args[0] > 100)
                return message.channel.send("**Please Enter A Number Less Than 100**");

            if (args[0] < 0)
                return message.channel.send("**Please Enter A Number More Than 0**");
            await message.delete();
            message.channel.bulkDelete(parseInt(args[0])).then(messages => message.channel.send(`**Succesfully deleted \`${parseInt(messages.size) - 1}/${args[0]}\` messages**`).then(msg => msg.delete({ timeout: 2000 }))).catch(() => null);
        } catch (error) {
            return message.channel.send("**You Can Only Delete Messages That Are Under 14 Days Old!**")
        };
    };
};