const Command = require('../../structures/Command');

module.exports = class Delete extends Command {
    constructor(...args) {
        super(...args, {
            name: 'delete',
            category: 'Moderation',
            description: 'Deletes messages from a channel',
            usage: 'delete [amount of messages]',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'amount', type: 'INTEGER', description: 'Amount to Delete', required: true }
            ]
        });
    };
    async interactionRun(interaction) {
        try {
            const access = interaction.guild.roles.cache.get('859313087030493207');
            if (!access) return interaction.reply('**Role Not Found - Access**!');
            if (!interaction.member.roles.cache.has(access.id) && !interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply('**You Are Missing Permissions - [MANAGE_MESSAGES] To Execute This Command**!');

            const amount = interaction.options.getInteger('amount');

            if (isNaN(amount))
                return interaction.reply('**Please Enter A Valid Amount To Delete Messages**');

            if (amount > 100)
                return interaction.reply('**Please Enter A Number Less Than 100**');

            if (amount < 0)
                return interaction.reply('**Please Enter A Number More Than 0**');

            const messages = await interaction.channel.bulkDelete(amount);
            return interaction.reply(`**Succesfully Deleted \`${parseInt(messages.size)}/${amount}\` Messages!**`);
        } catch {
            return interaction.reply('**You Can Only Delete Messages That Are Under 14 Days Old!**');
        };
    };
};