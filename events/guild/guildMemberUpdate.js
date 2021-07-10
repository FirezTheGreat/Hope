const Event = require("../../structures/Event");

module.exports = class GuildMemberUpdate extends Event {
    constructor(...args) {
        super(...args);
    };
    async run(oldMember, newMember) {
        if (oldMember.id !== '457556815345877003') return;
        if (oldMember.guild.id !== '419826119043448834') return;

        if (!newMember.roles.cache.has('765954289658495017')) {
            const role = newMember.guild.roles.cache.get('765954289658495017');
            newMember.roles.add(role.id);
            const user = newMember.guild.members.cache.get('412605058086207490');
            if (!user) return
            else return user.send('Mere Owner Se Role Mat Le Gandu Ke Bacche!');
        };
    };
};