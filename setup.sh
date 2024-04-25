#!/bin/bash
echo "installing packages"
apt install nodejs npm
sleep 1
echo "Updating repo"
git pull
sleep 2
echo "installing node packages"
npm i
sleep 2
echo "Make sure to make the edits to asterisk as mentioned in README.md"
sleep 1
echo "Moving to server directory"
cd src/server || exit
sleep 1
echo "Run: node index.js to start the server"
