const { CONFIG_FILE } = require('../const');
const chalk = require('chalk');
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const fs = require('fs');
const { program } = require('commander');


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
client = null;

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

get = function(url, keyword) {
    return new Promise((resolve, reject) => {
        client.get(url)
        .then(function (response) {
            if (keyword)
                if (response.data[keyword] != null){
                    resolve(response.data[keyword]);
                } else
                    reject(new Error('error'));
            else
                resolve(response.data);
        }).catch(async function (error) {
            if (error.response && error.response.status == 302 && error.response.headers.location.startsWith('/login/?')) {  
                // need to login
                await login();
                resolve(post(url, keyword));
            } else {
                if (error.code == 'ECONNABORTED') {
                    console.error(
                        chalk.yellow('reNgine server is taking a long time to respond. Consider narrowing your query or increase --timeout.\n')
                    );
                }
                reject(new Error(`${error.code}: ${error.message}`));
            }
        });
    });
}

getTargets = function(){
    return get('/api/queryTargets/', 'domains');
}

getSubdomains = function(scanId, targetId, targetName){
    var url = '/api/listSubdomains/?';
    if (scanId)
        url += `scan_id=${scanId}`;
    else if (targetId)
        url += `target_id=${targetId}`;
    else if (targetName)
        url += `target_name=${targetName}`;
    url += '&no_page';


    return get(url);
}

getScans = function(targetId, targetName){
    var url = '/api/listScanHistory/?';
    if (targetId)
        url += `target_id=${targetId}`;
    else if (targetName)
        url += `target_name=${targetName}`;
    return get(url, 'scan_histories');
}

getScanResults = function(scanId){
    return get(`/api/queryAllScanResultVisualise/?scan_id=${scanId}`);
}

getIPs = function(scanId, targetId, targetName, port){
    var url = '/api/listIps/?';
    if (scanId)
        url += `scan_id=${scanId}`;
    else if (targetId)
        url += `target_id=${targetId}`;
    else if (targetName)
        url += `target_name=${targetName}`;
    if (port)
        url += `&port=${port}`;
    url += '&no_page';
    

    return get(url);
}

getEndpoints = function(scanId, targetId, targetName){
    var url = '/api/queryEndpoints/?';
    if (scanId)
        url += `scan_id=${scanId}`;
    else if (targetId)
        url += `target_id=${targetId}`;
    else if (targetName)
        url += `target_name=${targetName}`;

    return get(url, 'endpoints');
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