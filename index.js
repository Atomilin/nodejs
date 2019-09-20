const commandsManager = require(`./commands`);
const userCommand = process.argv[2];

commandsManager(userCommand);