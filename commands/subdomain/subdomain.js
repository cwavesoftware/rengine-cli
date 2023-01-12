
const rengine = require('../../core/rengine');

listSubdomains  = async function() {
    await rengine.getSubdomains();
}

module.exports= {listSubdomains}

