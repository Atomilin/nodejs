const packageInfo = require(`../package.json`);

module.exports = {
  name: `--description`,
  description: `typing the description of application`,
  execute () {
    console.log(`${packageInfo.description}`);
  }
};