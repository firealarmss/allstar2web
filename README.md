# allstar2web

[![License](https://img.shields.io/badge/License-GPLv3-blue?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)

Play an allstarlink node to a web interface.

Written by Caleb, KO4UYJ

Inspired by https://github.com/firealarmss/dvm2web/

## Getting started

The target server is Allstarlink USRP

HamVoip will never be directly supported in this repository, however it should still work.

### Configure allstar2web

Edit the `config.example.yml` file to your needs. There is documentation in the file

### Configure allstarlink
```bash
nano /etc/asterisk/modules.conf
```
Find `noload => chan_usrp.so ;`

Replace with `load => chan_usrp.so ;`

Decide the allstar node you want to use. It can not be one connected to a radio.

```bash
nano /etc/asterisk/rpt.conf
```
Find the block that looks like this:
```bash
[YOUR NODE NUMBER]
 rxchannel = dahdi/pseud
; rxchannel = SimpleUSB/usb_560383
; rxchannel = Pi/1
; rxchannel = Radio/usb_560383
; rxchannel = Dahdi/1
; rxchannel = Beagle/1
; rxchannel = USRP/127.0.0.1:34001:32001
; rxchannel = Voter/560383 

```
Make sure all of them have a `;` in front of them except the one with USRP. It should look like this:
```bash
rxchannel = USRP/127.0.0.1:34001:32001
```
Then, restart it all and hope for the best
```bash
sudo astres.sh
```
### Running allstar2web

Make sure you have [node installed](https://nodejs.org/)

Note: Minimum supported is node version 16. NVM is recommended to manage node installed versions

```bash
cd allstar2web
sudo npm i
cd src/server
node index.js --config config.yml
```

### Usage

http://localhost:3000 will be the default location of the app

/fancy will show the XTL fancy page at all times

/simple will show the simple page at all times

Default "/" is defined by the user in the config
