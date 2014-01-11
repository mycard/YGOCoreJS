/* we are using JSLint to annoy us so here are some globals */
/* globals require, process, console, __dirname, Buffer */

var prompt      = require('prompt'); /* debugging prompt, use in development */
var WebSocket   = require('ws'); /* websockets */
var fs          = require('fs'); /* file system */
//var lzmajs      = require('lzma-purejs'); /* file compression for replay files, they have to be in lmza for intercompatiblity */
var ref         = require('ref');
var struct      = require('ref-struct');
var ffi         = require('ffi'); /* allows dynamic linking of the ocgapi.dll */
var MersenneTwister    = require('mersennetwister'); /* shuffler*/

//Constances
console.log(process.argv);
var launchpostion = 0;
                    
var configuration = {   
    'version'   : (1),
    'port'      : (1337),
    'banlist'   : (0),
    'cardpool'  : ( 2),
    'gamemode'  : ( 2),
    'priority'  : (0),
    'deckcheck' : ( 0),
    'shuffle'   : ( 0),
    'startLP'   : ( 8000),
    'starthand' : ( 5),
    'draw'      : (1),
    'timer'     : ( 180),
    'production': ( 0)
                    };
var gamestate= {
    started     : false,
    player0     : null,
    player1     : null,
    player2     : null,
    player3     : null,
    spectators  : 0,
    gamerules   : '',
    ranked      : false,
    start_time  : null,
    url         : 'ws://angelofcode.com:'+configuration.port+'/ygocorejs'
};
console.log('Configuration Loaded');

var player1 = 0;
var player2 = 1;

var card_data = struct({
    code        : 'uint32',
    alias       : 'uint32', 
    setcode     : 'uint64', 
    type        : 'uint32', 
    level       : 'uint32', 
    attribute   : 'uint32', 
    race        : 'uint32', 
    attack      : 'int32', 
    defence     : 'int32'
});


var script_reader  = struct({
    script_name :'char',
    len         :'int',
});
var card_reader     = struct({
    code        :'uint32',
    data        :card_data,
});
var pduel = ref.refType('uint32');
var message_handler = struct({
    pduel       : pduel,
    message_type: 'uint32'
});
var get_message_pointer = ref.refType('byte');
var ocgapi = ffi.Library(__dirname + '/ocgcore.dll', {
//    'set_script_reader'  : ['void',  [script_reader] ],
//    'set_card_reader'    : ['void',  [card_reader] ],
//    'set_message_handler': ['void',  [message_handler] ],
    'create_duel'        : ['pointer' ,  ['uint32'] ],
    'start_duel'         : ['void',  ['pointer', 'int'] ],
    'end_duel'           : ['void',  ['pointer']],
    'set_player_info'    : ['void',  ['pointer', 'int32', 'int32', 'int32', 'int32']],
    'get_log_message'    : ['void',  ['pointer', 'byte*']],
    'get_message'        : ['int32', ['pointer', get_message_pointer]],
    'process'            : ['int32', ['pointer']],
    'new_card'           : ['void',  ['pointer', 'uint32', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8']],
    'new_tag_card'       : ['void',  ['pointer', 'uint32', 'uint8', 'uint8']],
    'query_card'         : ['int32', ['pointer', 'uint8', 'uint8', 'int32', 'byte*', 'int32']],
    'query_field_count'  : ['int32', ['pointer', 'uint8', 'uint8']],
    'query_field_card'   : ['int32', ['pointer', 'uint8', 'uint8', 'int32', 'byte*', 'int32']],
    'query_field_info'   : ['int32', ['pointer', 'byte*']],
    'set_responsei'      : ['void',  ['pointer', 'int32']],
    'set_responseb'      : ['void',  ['pointer', 'byte*']],
    'preload_script'     : ['int32', ['pointer', 'char*', 'int32']]
}); /* 'function_name' : ['type', ['typeforParam1', 'typeforParam2']]
function_name(typeforParam1, typeforParam2, etc,..){
 dllprocessing...
 return type;
}
*/
console.log('OCGCore Engine Loaded');
var player1deck = require('./sample.deck.json');
var player2deck = require('./sample.deck.json');
function loaddeck(deck, playerid){
    for (var m = 0; m < deck.main.length; m++){
        ocgapi.new_card(pduel, deck.main[m], playerid, playerid,0x2, m, 0x01);
    }
    for (var e = 0; e < deck.extra.length; e++){
        ocgapi.new_card(pduel, deck.extra[e], playerid, playerid,0x40, e, 0x01);
    }
    
}

var mt = new MersenneTwister();
var seed = mt.int();
console.log('Virtualizing Duel :',seed);

var pduel = ocgapi.create_duel(seed);
//ocgapi.set_script_reader(script_reader);
//ocgapi.set_card_reader(card_reader);
//ocgapi.set_message_handler(message_handler);
ocgapi.set_player_info(pduel, player1, configuration.startLP, configuration.starthand, configuration.draw);
ocgapi.set_player_info(pduel, player2, configuration.startLP, configuration.starthand, configuration.draw);
loaddeck(player1deck,player1);
loaddeck(player2deck,player2);
ocgapi.start_duel(pduel,0);
process();
function process(){
    var engFlag = 0, engLen = 0, stop = 0;
    var engineBuffer = new Buffer(0x1000);
    while (!stop){
        if (engFlag == 2){ stop = 2; }
        var result = ocgapi.process(pduel);
        engLen = result & 0xffff;
        engFlag = result >> 16;
        

        console.log('engLen :', engLen, '= 2 means everything is working');
        console.log('engFlag :', engFlag);
        if (engLen > 0) {
            ocgapi.get_message(pduel, engineBuffer);
            
            stop = Analyze(engineBuffer, engLen);
            
            
            
        }
    }
    if(stop == 2){
          
    }
}
function Analyze(msgbuffer, len){
    
    var  offset, pbufw, pbuf = msgbuffer;
    var  player, count, type;
    console.log(pbuf - msgbuffer );
    while (pbuf - msgbuffer < len) {
                console.log(pbuf - msgbuffer );
                offset = pbuf;
                var engType = Buffer.ReadUInt8(pbuf);
        console.log('ana',engType);
                        return 1;
    }
    return 0;

}


/* checks if we started from node(true), or started from the command prompt(false) */




var lflist  = fs.readFileSync('lflist.conf').toString().split("\r\n");
var banlist = (function(lflist){
        var banlistcount = 0;
        var toreturn = [];
        for (var i = 0; (lflist.length) > 0; i++){
            if (lflist[i] !== undefined){
            if (lflist[i] !== ''){
                
                if (lflist[i][0] !== '#'){
                    if (lflist[i][0] === '!' ){
                        banlistcount++;
                        if (!toreturn[banlistcount]){toreturn[banlistcount] = [];}
                        
                    }else{
                        
                        if (lflist[i].indexOf(' ') > -1){
                        var toArray =  lflist[i].split(' ');
                        
                        
                        var topush = {cardId : toArray[0], quantity : toArray[1]};
                            
                        toreturn[banlistcount].push(topush);
                        }
                    }
                }
            }
        }}
    return toreturn;
})(lflist);

console.log('Listening at :', gamestate.url);
//var clientlistener = new WebSocket(gamestate.url);
//
//clientlistener.on('message', function(){
//    
//});




console.log('moving along');
