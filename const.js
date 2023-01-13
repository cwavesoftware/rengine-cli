const os = require('os');
const path = require('path');

const CONFIG_FILE = path.join(os.homedir(), '.config', 'rengine-cli.json');

module.exports = {CONFIG_FILE}