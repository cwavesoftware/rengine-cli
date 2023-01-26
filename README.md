<p align="center">
<img src=".github/banner.gif" alt=""/>
</p>

***This tool is developed and tested agains my [own fork of reNgine](http://github.com/cwavesoftware/rengine). Some features will not work with the [original reNgine](https://github.com/yogeshojha/rengine).***

## Installation
```
npm i -g git@github.com:cwavesoftware/rengine-cli.git
```

## Usage
### First run
```
$ rengine-cli config
```
### then
```
$ rengine-cli -h
Usage: rengine-cli [options] [command]

Options:
  -V, --version          output the version number
  -k, --insecure         Allow insecure server connections when using SSL (default: false)
  -T, --timeout <value>  Milliseconds to wait for response from server (default: 5000)
  -h, --help             display help for command

Commands:
  config                 Configure reNgine server connection parameters
  target
  subdomain
  scan
  scanresult
  ip
  endpoint
  org
  engine
  login                  login to reNgine server
                         Used mainly for testing configuration
  help [command]         display help for command
```

### Known issues:
1. It's slow with large amounts of data because of reNgine database. Use filters to overcome this.