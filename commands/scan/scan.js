
const rengine = require('../../core/rengine');

listScans  = async function(targetId) {
    await rengine.getScans(targetId);
}

module.exports= {listScans}

