
const rengine = require('../../core/rengine');

listSubdomains  = async function(scanId, targetId) {
    await rengine.getSubdomains(scanId, targetId);
}

module.exports= {listSubdomains}

