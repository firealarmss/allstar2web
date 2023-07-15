/*
    Caleb, KO4UYJ
    Inspired by https://github.com/firealarmss/dvm2web/
*/
import dgram from 'dgram';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import yaml from "js-yaml";
import logger from "./logger.js";
import { Command } from 'commander';
import * as path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const udpSocket = dgram.createSocket('udp4');

let httpPort = 3000;
let udpRxPort = 34001;
let udpRxAddress = "127.0.0.1";
let httpAddress = "0.0.0.0";
let fancyDisplayDefault = false;
let hostCallsign = "N0PE";
let debug = false;

const program = new Command();

program
    .version('1.5.0')
    .description('DVM2WEB')
    .option('-c, --config <config>', 'Specify the config file')
    .parse(process.argv);

let { config } = program.opts();
console.log(config)
if (!config){
    logger.warn(`Config file not specified. Will try default values`);
}
if (debug){
    config = "./config.yml";
}
try {
    fs.readFile(config, 'utf8', function (err, data) {
        if (debug) {
            logger.debug(`Config File Info: \n${data}`);
        }
        logger.info(`Read config file: ${config}`);
        let obj = yaml.load(data);
        // console.log(obj.udpRxAddress);
        httpPort = obj.httpPort;
        udpRxPort = obj.udpRxPort;
        udpRxAddress = obj.udpRxAddress;
        httpAddress = obj.httpAddress;
        fancyDisplayDefault = obj.fancyDisplayDefault;
        hostCallsign = obj.hostCallsign;
        debug = obj.debug;
        logger.info(
            "Config Values:" +
            `\n     HTTP Port: ${httpPort}` +
            `\n     UDP RX Port: ${udpRxPort}` +
            `\n     UDP RX Address: ${udpRxAddress}` +
            `\n     HTTP Address: ${httpAddress}` +
            `\n     Device Callign: ${hostCallsign}` +
            `\n     Fancy display by default: ${fancyDisplayDefault}` +
            `\n     Debug: ${debug}`
        );
    });
} catch (err){
    logger.error(`Error reading config file   ${err}`)
}
app.set("views", path.join("../views"));
app.set('view engine', 'ejs');
app.use('/public', express.static('../public'))

app.get('/', (req, res) => {
   // res.sendFile(__dirname + "/index.html");
    if (fancyDisplayDefault) {
        res.render('index', {hostCallsign: hostCallsign});
    } else {
        res.render('simple', {hostCallsign: hostCallsign});
    }
});

app.get('/simple', (req, res) => {
    res.render('simple', {hostCallsign: hostCallsign});
});

app.get('/fancy', (req, res) => {
    res.render('index', {hostCallsign: hostCallsign});
});

let isReceivingMessage;
udpSocket.on('message', (message) => {
    const packetSize = message.length;
    if (packetSize >= 32) {
        const packetTypeAsNum = message.readUInt32LE(20);
        let packetType;
        if (packetTypeAsNum === 0) {
            if (packetSize === 32) {
                packetType = "End";
            } else {
                packetType = "Audio";
            }
        } else if (packetTypeAsNum === 2) {
            packetType = "Start";
        } else {
            packetType = "Audio";
        }
        logger.info(`Received allstarlink data: ${packetType} (length: ${packetSize}, ptt: ${message.readUInt32BE(12)})`);

        if (packetType === "Audio") {
            const audioData = message.slice(32, 352);
	    const decodedData = new Uint8Array(message);
	    io.emit("channelAudio", JSON.stringify({
                "audio": audioData
            }));
	    if (debug){
	        logger.debug(decodedData);
	    }
        }
    }
    isReceivingMessage = false;
});
//Future additions for whacker emrgency
let ignore_peers = [
    "1"
]
io.on("connection",function (socket){
    socket.on("EMERG", function(msg){
        if (!ignore_peers.includes(msg.srcId)) {
            io.emit("EMERG", {srcId: msg.srcId, dstId: msg.dstId});
            logger.info(`Emerg recieved from: ${msg.srcId}`)
        } else {
            logger.info(`Ignored emerg from: ${msg.srcId}`)
        }
    });
});

server.listen(httpPort, httpAddress, () => {
    if (debug) {
        logger.warn('Debug mode enabled');
    }
    logger.info(`HTTP Listening on ${httpAddress}:${httpPort}`);
});
udpSocket.bind(udpRxPort, udpRxAddress,() => {
    logger.info(`Listening for DVM data on ${udpRxAddress}:${udpRxPort}`);
});
