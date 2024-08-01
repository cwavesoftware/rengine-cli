const { CONFIG_FILE } = require('../const');
const chalk = require('chalk');
const axios = require('axios');
const { CookieJar, permuteDomain } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const fs = require('fs');
const { program } = require('commander');


var cnf = null;
try {
  cnf = require(CONFIG_FILE);
} catch (err) {
  if (process.argv.length >= 3 && process.argv[2] != 'config') {
    console.log(chalk.yellow('No config found. Run ' + chalk.green('rengine-cli config') + ' first.'));
    process.exit(-1);
  }
}

const jar = new CookieJar();
sessId = null;
client = null;

loadSessId = function() {
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

login = function() {
  return new Promise((resolve, reject) => {
    client.get('/login/')
      .then(async ({ config }) => {
        client.post('/login/',
          {
            username: cnf.rengine.username,
            password: cnf.rengine.password,
            csrfmiddlewaretoken: config.jar.getCookiesSync(config.baseURL) ? config.jar.getCookiesSync(config.baseURL)[0].value : ''
          }
        ).then(function(response) {
          if (new RegExp('Oops! Invalid username or password\.').test(response.data)) {
            console.error(chalk.red(`Oops! Invalid username or password.`));
            process.exit(-2);
          }
        }).catch(function(error) {
          if (error.response.status == 302 && !error.response.headers.location.startsWith('/login/?')) {  // success
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
      .then(function(response) {
        if (keyword)
          if (response.data[keyword] != null) {
            resolve(response.data[keyword]);
          } else
            reject(new Error('unexpected error\n'));
        else
          resolve(response.data);
      }).catch(async function(error) {
        if (error.response && error.response.status == 302 && error.response.headers.location.startsWith('/login/?')) {
          // need to login
          await login();
          resolve(get(url, keyword));
        } else {
          if (error.code == 'ECONNABORTED') {
            console.error(
              chalk.yellow('reNgine server is taking a long time to respond. Consider narrowing your query or increase --timeout.\n')
            );
          }
          reject(new Error(`${error.code}: ${error.message}\n`));
        }
      });
  });
}

post = function(url, body) {
  return new Promise((resolve, reject) => {
    client.post(url, body)
      .then(function(response) {
        if (new RegExp('<div class="invalid-feedback"(.|\n|\r)*already exists(\n|\r)*( )*<\/div>').test(response.data)) {
          console.error(chalk.yellow(`WARNING: already exists`));
          resolve(true);
        }
        reject(new Error('unknown error\n')); // I know, is weird. In reNgine, 200 usually means something went wrong
      }).catch(async function(error) {
        if (error.response && error.response.status == 302) {
          if (error.response.headers.location.startsWith('/login/?')) {
            // need to login
            await login();
            resolve(post(url, body));
          } else {  // success
            resolve(true);
          }
        } else {
          if (error.code == 'ECONNABORTED') {
            console.error(
              chalk.yellow('reNgine server is taking a long time to respond. Consider narrowing your query or increase --timeout.\n')
            );
          }
          reject(new Error(`${error.code}: ${error.message}\n`));
        }
      });
  });
}

put = function(url, body) {
  return new Promise((resolve, reject) => {
    client.put(url, body)
      .then(function(response) {
        resolve(true);
      }).catch(async function(error) {
        if (error.response && error.response.status == 302) {
          if (error.response.headers.location.startsWith('/login/?')) {
            // need to login
            await login();
            resolve(put(url, body));
          } else {
            reject(new Error(`${error.code}: ${error.message}\n`));
          }
        } else {
          if (error.code == 'ECONNABORTED') {
            console.error(
              chalk.yellow('reNgine server is taking a long time to respond. Consider narrowing your query or increase --timeout.\n')
            );
          }
          reject(new Error(`${error.code}: ${error.message}\n`));
        }
      });
  });
}

getTargets = function(targetId, targetName) {
  var url = '/api/queryTargets/';
  if (targetId)
    url += `?target_id=${targetId}`
  else if (targetName)
    url += `?target_name=${targetName}`

  return get(url, 'domains');
}

getSubdomains = function(scanId, targetId, targetName) {
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

getNewSubdomains = function(scanId) {
  var url = `/api/scan/${scanId}/newSubs`;
  return get(url);
}
getScans = function(targetId, targetName) {
  var url = '/api/listScanHistory/?';
  if (targetId)
    url += `target_id=${targetId}`;
  else if (targetName)
    url += `target_name=${targetName}`;
  return get(url, 'scan_histories');
}

getScanResults = function(scanId) {
  return get(`/api/queryAllScanResultVisualise/?scan_id=${scanId}`);
}

getIPs = function(scanId, targetId, targetName, port) {
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

getEndpoints = function(scanId, targetId, targetName) {
  var url = '/api/queryEndpoints/?';
  if (scanId)
    url += `scan_id=${scanId}`;
  else if (targetId)
    url += `target_id=${targetId}`;
  else if (targetName)
    url += `target_name=${targetName}`;

  return get(url, 'endpoints');
}

getOrgs = function(orgName) {
  var url = '/api/listOrganizations/?';
  if (orgName)
    url += `org_name=${orgName}`;
  return get(url, 'organizations');
}

createOrg = function(orgName, orgDescription) {
  var url = '/target/add/organization';
  return post(url, {
    name: orgName,
    description: orgDescription
  });
}

createTarget = function(name, desc, h1handle) {
  var url = '/target/add/target';
  return post(url, {
    name: name,
    description: desc,
    h1_team_handle: h1handle,
    'add-target': 'submit'
  });
}

triggerScan = function(tid, eid, subsFile) {
  var url = `/scan/start/${tid}`;
  var subs = '';
  try {
    subs = fs.readFileSync(subsFile, 'utf8');
  } catch (ex) {
    console.error(chalk.yellow(`WARNING: ${ex.message}\nScan started with no subdomains imported`));
  } finally {
    return post(url, {
      scan_mode: eid,
      importSubdomainTextArea: subs,
      outOfScopeSubdomainTextarea: ''
    });
  }
}

scanStatus = function(scanId) {
  var url = `/api/scan/${scanId}/status`
  return get(url);
}

getEngines = function(name) {
  var url = '/api/listEngines/?';
  if (name)
    url += `engine_name=${name}`;
  return get(url, 'engines');
}

addTargetToOrg = function(tid, oid) {
  var url = `/api/organization/${oid}`;
  return put(url, {
    targetId: tid
  })
}

module.exports = {
  login,
  getTargets,
  getSubdomains,
  getScans,
  getScanResults,
  getIPs,
  getEndpoints,
  getOrgs,
  createOrg,
  createTarget,
  triggerScan,
  getEngines,
  addTargetToOrg,
  getNewSubdomains,
  scanStatus
}
