For each YGOPro implementation theree are four programs that need to be running to maintain the system.
* Player 1's Client
* Player 2's Client
* Server's Client
* Server Management Software.

YGOCore.js is an implementation of the Server's Client executable using Nodejs. To accoumplish this the system uses the OCGAPI folder of the main YGOPro respitories Github to compile a *.dll file. Nodejs then connects to this system via a linker and manages in incoming and outgoing connections via common websockets. Websockets have a specific API that is broken in all other current implementations of it, so this system is required for a pure implementation in the browser.

After game end the information is compressed in the standard format and  stored on the server, the user is given an URL to use to retrieve it. The core via JSON then stores statistical information in our database and disconnects and shuts down.