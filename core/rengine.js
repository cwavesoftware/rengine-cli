const cnf = require('config');
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
    baseURL: cnf.get('rengine.url'),
    headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Cookie': `sessionid=${sessId}`
    },
    maxRedirects: 0
}));

const rengineUrl = cnf.get('rengine.url');

login = function(){
    return new Promise((resolve, reject) => {
        client.get('/login/')
        .then(({ config }) => {
            client.post(
                `${rengineUrl}/login/`,
                {
                    username: cnf.get('rengine.username'),
                    password: cnf.get('rengine.password'),
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

getTargets = function(){
    return new Promise((resolve, reject) => {
        client.get('/api/queryTargets/')
        .then(function (response) {
            console.log(response.data.domains != null ? response.data.domains : chalk.red('error'));
        }).catch(async function (error) {
            if (error.response.status == 302 && error.response.headers.location.startsWith('/login/?')) {  
                // need to login
                await login();
                getTargets();
            }
        });
    });
}

module.exports = { login, getTargets }