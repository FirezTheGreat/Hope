const Event = require('../../structures/Event');
const { MessageAttachment } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = class GuildMemberAdd extends Event {
    constructor(...args) {
        super(...args);
    };

    async run(member) {
        try {
            const role = member.guild.roles.cache.find(r => r.name.toLowerCase() === 'community');
            if (!role) return;

            const channel = member.guild.channels.cache.get('419852380193161216');
            if (!channel) return;

            const canvas = createCanvas(700, 250);
            const ctx = canvas.getContext('2d');
            const background = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'wallpaper.png'));

            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#74037b';
            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            ctx.font = applyText(canvas, `${member.user.username} Welcome to`);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${member.user.username} Welcome to`, canvas.width / 3, canvas.height / 3);
            ctx.font = '40px Arial';
            ctx.fillText(`${member.guild.name}`, canvas.width / 3, canvas.height / 1.75);
            ctx.font = '32px sans-serif';
            ctx.fillText(`Member #${member.guild.memberCount}`, canvas.width / 3, canvas.height / 1.3);

            ctx.beginPath();
            ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
            ctx.lineWidth = 8;
            ctx.strokeStyle = "white";
            ctx.stroke();
            ctx.closePath();
            ctx.clip();

            const avatar = await loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
            ctx.drawImage(avatar, 25, 25, 200, 200);

            const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.png');
            channel.send(`**Hey ${member}, I hope you have a nice day :hugging:!!**`, { files: [attachment], name: 'welcome.png' });
            await member.roles.add(role.id);

            try {
                await member.send(`
:small_blue_diamond: Hi ${member}, welcome to the HOPE UPRISING Discord server. We are happy to see you! :smiley: 

:small_orange_diamond: Please make sure you read information in <#422473080770920448> to familiarize yourself with our Discord server.

:small_orange_diamond: If you have any problems or queries don't hesitate to *DM* the **Managers** or the **Leader**  

:small_orange_diamond: **I hope you have a great day, Enjoy!**`);
            } catch (error) {
                return;
            };
            return;
        } catch (error) {
            return console.error(error);
        };
    }
};

function applyText(canvas, text) {
    const ctx = canvas.getContext('2d');

    let fontSize = 65;

    do {
        ctx.font = `${fontSize -= 10}px Arial`;
    } while (ctx.measureText(text).width > canvas.width - 300);

    return ctx.font;
};