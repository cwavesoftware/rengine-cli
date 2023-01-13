
const rengine = require('../../core/rengine');

listScanResults  = async function(scanId) {
    await rengine.getScanResults(scanId);
}

module.exports= {listScanResults}

