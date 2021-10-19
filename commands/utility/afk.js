const Command = require('../../structures/Command');
const AFKList = require('../../structures/models/AFKList');

module.exports = class AwayFromKeyboard extends Command {
    constructor(...args) {
        super(...args, {
            name: 'afk',
            category: 'utility',
            description: 'Sets User As AFK',
            usage: '[reason] (optional)',
            accessableby: 'Everyone',
            slashCommand: true,
            commandOptions: [
                { name: 'reason', type: 'STRING', description: 'Reason for AFK', required: false }
            ]
        });
    };
    async interactionRun(interaction) {
        try {
            const reason = interaction.options.getString('reason') || null;
            const AFK = await AFKList.findOne({ ID: interaction.user.id });

            if (!AFK) {
                AFKList.create({
                    ID: interaction.user.id,
                    name: interaction.user.username,
                    reason: reason || 'AFK'
                });
                return interaction.reply(`**I Have Set Your AFK\nReason - __${reason || 'AFK'}__!**`);
            } else {
                return interaction.reply(`**Your AFK Is Already Set**`);
            };
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};