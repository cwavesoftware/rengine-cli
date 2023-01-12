const os = require('os');
const path = require('path');
const cnf = require(path.join(`${os.homedir}`, '.config', 'rengine-cli.json'));
const chalk = require('chalk');
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const fs = require('fs');

const jar = new CookieJar();
sessId = null;

loadSessId = function () {
    try {
        data = JSON.parse(fs.readFileSync('cookiejar'));
        sessId = data.idx[Object.keys(data.idx)[0]]['/']['sessionid'].value
    } catch (err) {
        console.log(chalk.yellow('cookiejar not found, we need to login again'));
    }
}
loadSessId();

const client = wrapper(axios.create({ 
    jar,
    baseURL: cnf.rengine.url,
    headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Cookie': `sessionid=${sessId}`
    },
    maxRedirects: 0
}));

login = function(){
    return new Promise((resolve, reject) => {
        client.get('/login/')
        .then(({ config }) => {
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
                    console.log(chalk.green('Login OK'));
                    try {
                        fs.writeFileSync('cookiejar', JSON.stringify(error.config.jar.store));
                        loadSessId();
                        client.defaults.headers['Cookie'] = `sessionid=${sessId}`;
                        resolve(true);
                    } catch (err) {
                        console.error(err);
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
            console.log(response.data[keyword] != null ? JSON.stringify(response.data[keyword]) : chalk.red('error'));
        }).catch(async function (error) {
            if (error.response.status == 302 && error.response.headers.location.startsWith('/login/?')) {  
                // need to login
                await login();
                post(url, keyword);
            }
        });
    });
}

getTargets = function(){
    return post('/api/queryTargets/', 'domains');
}

getSubdomains = function(){
    return post('/api/querySubdomains/', 'subdomains');
}



module.exports = { login, getTargets, getSubdomains }