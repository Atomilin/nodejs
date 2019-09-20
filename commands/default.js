const name = Symbol.for(`default`);
// default command
const sort = require(`./sort`);

module.exports = {
  description: `default commands`,
  name,
  execute () {
    console.log(`Hello! default command is ${sort.name}`);
    sort.execute();
  }
};