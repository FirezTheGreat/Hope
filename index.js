const Hope = require('./structures/Hope');
const config = require('./config.json');

const bot = new Hope(config);
bot.start();