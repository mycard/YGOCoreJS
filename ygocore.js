/* we are using JSLint to annoy us so here are some globals */
/* globals require, process, console, __dirname */

var prompt      = require('prompt'); /* debugging prompt, use in development */
var WebSocket   = require('ws'); /* websockets */
var fs          = require('fs'); /* file system */
//var lzmajs      = require('lzma-purejs'); /* file compression for replay files, they have to be in lmza for intercompatiblity */
var ref         = require('ref');
var struct      = require('ref-struct');
var ffi         = require('ffi'); /* allows dynamic linking of the ocgapi.dll */
var MersenneTwister    = require('mersennetwister'); /* shuffler*/

//Constances
var configuration = {   
    'version'   : (process.argv[(launchpostion+0)] ? process.argv[(launchpostion+0)] : 1),
    'port'      : (process.argv[(launchpostion+1)] ? process.argv[(launchpostion+0)] : 1337),
    'banlist'   : (process.argv[(launchpostion+2)] ? process.argv[(launchpostion+0)] : 0),
    'cardpool'  : (process.argv[(launchpostion+3)] ? process.argv[(launchpostion+0)] : 2),
    'gamemode'  : (process.argv[(launchpostion+4)] ? process.argv[(launchpostion+0)] : 2),
    'priority'  : (process.argv[(launchpostion+5)] ? process.argv[(launchpostion+0)] : 0),
    'deckcheck' : (process.argv[(launchpostion+6)] ? process.argv[(launchpostion+0)] : 0),
    'shuffle'   : (process.argv[(launchpostion+7)] ? process.argv[(launchpostion+0)] : 0),
    'startLP'   : (process.argv[(launchpostion+8)] ? process.argv[(launchpostion+0)] : 8000),
    'starthand' : (process.argv[(launchpostion+9)] ? process.argv[(launchpostion+0)] : 5),
    'draw'      : (process.argv[(launchpostion+10)] ? process.argv[(launchpostion+0)] : 1),
    'timer'     : (process.argv[(launchpostion+11)] ? process.argv[(launchpostion+0)] : 180),
    'production': (process.argv[(launchpostion+12)] ? process.argv[(launchpostion+0)] : 0)
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

var card_data = ref.refType('uint32');
var pduel = ref.refType('uint32');
var script_reader   = struct({
    script_name : 'char*',
    len         : 'int*'
});
var card_reader     = struct({
    code        :'uint32',
    data        :card_data,
});
var message_handler = struct({
    pduel       : pduel,
    message_type: 'uint32'
});

var ocgapi = ffi.Library(__dirname + '/ocgcore.dll', {
    'set_script_reader'  : ['void',  [script_reader] ],
    'set_card_reader'    : ['void',  [card_reader] ],
    'set_message_handler': ['void',  [message_handler] ],
    'create_duel'        : ['pointer' ,  ['uint32'] ],
    'start_duel'         : ['void',  ['pointer', 'int'] ],
    'end_duel'           : ['void',  ['pointer']],
    'set_player_info'    : ['void',  ['pointer', 'int32', 'int32', 'int32', 'int32']],
    'get_log_message'    : ['void',  ['pointer', 'byte*']],
    'get_message'        : ['int32', ['pointer', 'byte*']],
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

var mt = new MersenneTwister();
var seed = mt.int();
console.log('Virtualizing Duel :',seed);

var pduel = ocgapi.create_duel(seed);

ocgapi.set_player_info(pduel, player1, configuration.startLP, configuration.starthand, configuration.draw);

ocgapi.set_player_info(pduel, player2, configuration.startLP, configuration.starthand, configuration.draw);
ocgapi.start_duel(pduel,1);
function ask(){
    var c= ocgapi.process(pduel);
 
    d = new Buffer(512);
    ocgapi.get_message(pduel, d);
    console.log(c);
    out = d.readUInt32LE(0);
    console.log(parseInt(out,10) );
    
}
ask()
ask()
ask()
ask()
ask()

/* checks if we started from node(true), or started from the command prompt(false) */
var launchpostion = (process.argv[0] === 'node') ?
                    0 :
                    2 ;



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
var clientlistener = new WebSocket(gamestate.url);

clientlistener.on('message', function(){
    
});




console.log('moving along');
