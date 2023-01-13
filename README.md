<p align="center">
<img src=".github/banner.gif" alt=""/>
</p>

***This tool is WIP. Currently supported features are listed in the help menu***

***This tool is developed and tested agains my [own fork of reNgine](http://github.com/cwavesoftware/rengine). Some features will not work with the [original reNgine](https://github.com/yogeshojha/rengine).***

## Installation
```
npm i -g git@github.com:cwavesoftware/rengine-cli.git
```

## Usage
```
$ rengine-cli -h
Usage: rengine-cli [options] [command]

Options:
  -k, --insecure  Allow insecure server connections when using SSL (default: false)
  -h, --help      display help for command

Commands:
  config          Configure reNgine server connection parameters
  target
  subdomain
  scan
  scanresult
  ip
  endpoint
  help [command]  display help for command
```