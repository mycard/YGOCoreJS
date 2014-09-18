Project discontiuned see 
https://github.com/SalvationDevelopment/YGOPro-Support-System

For each YGOPro implementation there are four programs that need to be running to maintain the system.
* Player 1's Client
* Player 2's Client
* Server's Client
* Server Management Software.

YGOCore.js is an implementation of the Server's Client executable using Nodejs. To accoumplish this the system uses the OCGAPI folder of the main YGOPro respitories Github to compile a *.dll file. Nodejs then connects to this system via a linker and manages in incoming and outgoing connections via common websockets. Websockets have a specific API that will cause a websocket to fail when sent over binary in all other current implementations of it, so this system is required for a proper implementation in the browser with out an overhead plugin.

The core can be started via command prompt or .fork in nodejs. the command prompt version will cause it to open in debug mode. 
After game end the information is compressed in the standard format and  stored on the server, the user is given an URL to use to retrieve it. The core via JSON then stores statistical information in our database and disconnects and shuts down.

Installation
============

Requirements
------------
NodeJS
GitHub (Git)


``` bash
cd /installation-directory/
git clone git://github.com/SalvationDevelopment/YGOCoreJS/YGOCore.git
npm install prompt
npm install ws
npm install lzma-purejs
npm install nodeffi
```

Running
-------
A single core for testing reasons can be spun up via command prompt, options are intergers unless otherwise stated.
``` bash
node ygocore [version] [port] [banlist] [cardpool] [gamemode] [priority(true/false)] [deckcheck] [shuffle] [startlp] [draw] [timer] [development-mode(true/false)]
```
