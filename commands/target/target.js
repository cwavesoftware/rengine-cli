const config = require('config');
const rengine = require('../../core/rengine');

listTargets  = async function() {
    await rengine.getTargets();
}

module.exports= {listTargets}