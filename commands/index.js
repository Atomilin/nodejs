const sort = require(`./sort`);
const description = require(`./description`);
const help = require(`./help`);
const defaultCommand = require(`./default`);

const ERROR_EXIT_CODE = 1;

const commands = new Map(
  [
    description,
    help,
    sort,
    defaultCommand
  ].map((command) => (
    [command.name, command.execute]
  ))
);

module.exports = (command = Symbol.for(`default`)) => {
  if (commands.has(command)) {
    commands.get(command)();
  } else {
    help.execute();
    process.exitCode = ERROR_EXIT_CODE;
  }
};