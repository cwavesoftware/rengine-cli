const { CONFIG_FILE } = require('../const');
const chalk = require('chalk');
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const fs = require('fs');
var cnf = null;
try {
    cnf = require(CONFIG_FILE);
} catch(err) {
    if (process.argv.length >= 3 && process.argv[2] != 'config') {
        console.log(chalk.yellow('No config found. Run ' + chalk.green('rengine-cli config') + ' first.'));
        process.exit(-1);
    }
}

const jar = new CookieJar();
sessId = null;
var client = null;

loadSessId = function () {
    try {
        data = JSON.parse(fs.readFileSync('cookiejar'));
        sessId = data.idx[Object.keys(data.idx)[0]]['/']['sessionid'].value
    } catch (err) {
        // cookiejar not found
    }
}
loadSessId();

if (cnf) {
    client = wrapper(axios.create({
        jar,
        baseURL: cnf.rengine.url,
        headers: {
            'Content-type': 'application/x-www-form-urlencoded',
            'Cookie': `sessionid=${sessId}`
        },
        maxRedirects: 0,
        timeout: cnf.connection.timeout
    }));
}

login = function(){
    return new Promise((resolve, reject) => {
        client.get('/login/')
        .then(async ({ config }) => {
            client.post('/login/',
                {
                    username: cnf.rengine.username,
                    password: cnf.rengine.password,
                    csrfmiddlewaretoken: config.jar.getCookiesSync(config.baseURL) ? config.jar.getCookiesSync(config.baseURL)[0].value : ''
                }
            ).then(function (response) {
                // console.log(response);
            }).catch(function (error) {
                if (error.response.status == 302 && error.response.headers.location == '/') {  // success
                    console.error(chalk.green('Login OK'));
                    try {
                        fs.writeFileSync('cookiejar', JSON.stringify(error.config.jar.store));
                        loadSessId();
                        client.defaults.headers['Cookie'] = `sessionid=${sessId}`;
                        resolve(true);
                    } catch (err) {
                        console.error(chalk.red(err));
                      }
                }
            });
        });
    });
}

post = function(url, keyword) {
    return new Promise((resolve, reject) => {
        client.get(url)
        .then(function (response) {
            if (keyword)
                if (response.data[keyword] != null){
                    resolve(response.data[keyword]);
                } else
                    reject(new Error('error'));
            else
                resolve({resp:response.data, err:null});
        }).catch(async function (error) {
            if (error.response && error.response.status == 302 && error.response.headers.location.startsWith('/login/?')) {  
                // need to login
                await login();
                resolve(post(url, keyword));
            } else {
                if (error.code == 'ECONNABORTED') {
                    console.error(
                        chalk.yellow('reNgine server is taking a long time to respond. Consider using pagination.\n')
                    );
                }
                reject(new Error(`${error.code}: ${error.message}`));
            }
        });
    });
}

getTargets = function(){
    return post('/api/queryTargets/', 'domains');
}

getSubdomains = function(scanId, targetId){
    var url = '/api/querySubdomains/?';
    if (scanId)
        url += `scan_id=${scanId}`;
    else if (targetId)
        url += `target_id=${targetId}`;

    return post(url, 'subdomains');
}

getScans = function(targetId){
    var url = '/api/listScanHistory/?';
    if (targetId)
        url += `target_id=${targetId}`;
    return post(url, 'scan_histories');
}

getScanResults = function(scanId){
    return post(`/api/queryAllScanResultVisualise/?scan_id=${scanId}`);
}

getIPs = function(scanId, targetId, port){
    var url = '/api/queryIps/?';
    if (scanId)
        url += `scan_id=${scanId}`;
    else if (targetId)
        url += `target_id=${targetId}`;
    if (port)
        url += `&port=${port}`;

    return post(url, 'ips');
}

getEndpoints = function(scanId, targetId){
    var url = '/api/queryEndpoints/?';
    if (scanId)
        url += `scan_id=${scanId}`;
    else if (targetId)
        url += `target_id=${targetId}`;

    return post(url, 'subdomains');
}

module.exports = { 
    login, 
    getTargets,
    getSubdomains, 
    getScans, 
    getScanResults, 
    getIPs, 
    getEndpoints 
}