const filter = require("../../structures/music/filter");
let breaked = false;
const { MessageEmbed } = require('discord.js');
const Command = require("../../structures/Command");

module.exports = class BassBoost extends Command {
    constructor(...args) {
        super(...args, {
            name: 'bassboost',
            aliases: ['bb'],
            category: 'music',
            description: 'Bass Boosts The Song',
            usage: '[-10 - 10] (optional)',
            accessableby: 'everyone'
        });
    };
    async run(message, args) {
        try {
            const player = this.bot.music.players.get(message.guild.id);
            if (!player || (player.queue.size === 0 && player.position === 0 && !player.playing)) return message.channel.send('**❌ Nothing Playing In This Server!**');

            const { channel } = message.member.voice;
            if (!channel) return message.channel.send(`**❌ You Are Not Connected To Any Voice Channel!**`);

            if (!args[0]) {
                if (player.bands[0] !== 0) {
                    breaked = true;
                } else breaked = false;

                if (breaked) {
                    player.setEQ(...filter.reset);
                    const msg = await message.channel.send(`**Turning Off __bassboost__! This May Take A Few Seconds!**`);
                    const embed = new MessageEmbed()
                        .setDescription('**Turned Off __bassboost__**')
                        .setColor('GREEN');
                    setTimeout(() => {
                        msg.edit('', { embed: embed });
                    }, 5000);
                } else {
                    player.setEQ(...Array(6).fill(0).map((n, i) => ({ band: i, gain: 0.65 })));
                    const msg = await message.channel.send(`**Turning On __bassboost__! This May Take A Few Seconds!**`);
                    const embed = new MessageEmbed()
                        .setDescription('**Turned On __bassboost__**')
                        .setColor('GREEN');
                    setTimeout(() => {
                        msg.edit('', { embed: embed });
                    }, 5000);
                };
                return;
            };
            if (isNaN(args[0])) return message.channel.send('**Please Enter A Valid Number!**');

            if (args[0] <= 10 && args[0] >= -10) {
                player.setEQ(...Array(6).fill(0).map((n, i) => ({ band: i, gain: args[0] / 10 })));
            } else return message.channel.send(`**Enter A Number Between -10 to 10**!`);

            const msg = await message.channel.send(`**Turning BassBoost To __${args[0]}__! This May Take A Few Seconds!**`);
            const embed = new MessageEmbed()
                .setDescription(`**Bassboost Set To: __${args[0]}__**`)
                .setColor('GREEN');
            setTimeout(() => {
                msg.edit('', embed);
            }, 5000);
            return;
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};