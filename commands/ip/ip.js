
const rengine = require('../../core/rengine');

listIPs  = async function(scanId, targetId, port) {
    await rengine.getIPs(scanId, targetId, port);
}

module.exports= {listIPs}

