const sort = require(`./sort`);
const description = require(`./description`);

const commands = [
  sort,
  description
];

const help = commands.map((command) => `${command.name} — ${command.description}`).join(`\n\t`);

module.exports = {
  name: `--help`,
  description: `shows program help`,
  execute () {
    console.log(
      `Available commands:
        ${help}`
    );
  }
};