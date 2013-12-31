/* we are using JSLint to annoy us so here are some globals */
/* globals require, process, console, __dirname */

var prompt      = require('prompt'); /* debugging prompt, use in development */
var WebSocket   = require('ws'); /* websockets */
var fs          = require('fs'); /* file system */
//var lzmajs      = require('lzma-purejs'); /* file compression for replay files, they have to be in lmza for intercompatiblity */
var ref         = require('ref');
var struct      = require('ref-struct');
var ffi         = require('ffi'); /* allows dynamic linking of the ocgapi.dll */


var pduel       = ref.alloc('int');
var script_name = ref.alloc('char');
var len         = ref.alloc('int');
var script_reader   = struct({
    script_name : 'char*',
    len         : 'int*'
});
//var card_reader     = struct({
//    code        :'uint32',
//    data        :card_data,
//});
var message_handler = struct({
    pduel       : 'void*',
    message_type: 'uint32'
});

var ocgapi = ffi.Library(__dirname + '/ocgcore.dll', {
    'set_script_reader'  : ['void',  [script_reader] ],
//    'set_card_reader'    : ['void',  ['card_reader '] ],
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
    
    
    
    
}); /* 'function_name' : ['type', ['typeforParam1', 'typeforParam2']]*/



ocgapi.set_script_reader(['a', 10110]);






/* checks if we started from node(true), or started from the command prompt(false) */
var launchpostion = (process.argv[0] === 'node') ?
                    0 :
                    2 ;
var configuration = {   
    'version'   : process.argv[(launchpostion+0)],
    'port'      : process.argv[(launchpostion+1)],
    'banlist'   : process.argv[(launchpostion+2)],
    'cardpool'  : process.argv[(launchpostion+3)],
    'gamemode'  : process.argv[(launchpostion+4)],
    'priority'  : process.argv[(launchpostion+5)],
    'deckcheck' : process.argv[(launchpostion+6)],
    'shuffle'   : process.argv[(launchpostion+7)],
    'startLP'   : process.argv[(launchpostion+8)],
    'draw'      : process.argv[(launchpostion+9)],
    'timer'     : process.argv[(launchpostion+10)],
    'production': process.argv[(launchpostion+11)]
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

console.log(configuration);
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
var clientlistener = new WebSocket(gamestate.url);
clientlistener.on('message', function(){
    
});




console.log('moving along');
