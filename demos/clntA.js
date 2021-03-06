// Copyright (c) 2012 Tom Zhou<appnet.link@gmail.com>
'use strict';

var SEP   = require('../lib/sep');
var nmCln = require('../lib/appnet.link');

// appnet.link library
var WebSocket       = require('wspp').wspp;
var WebSocketServer = WebSocket.Server;

// msgpack library
var msgpack = require('msgpack-js');

// vURL
var vURL = require('../lib/vurl');

// create websocket server with name-client
var creatNmclnWss = function(self) {
    var wss;
    
    wss = new WebSocketServer({httpp: true, server: self.bsrv.srv, path: SEP.SEP_CTRLPATH_BS});
    wss.on('connection', function(client){    
        console.log('new ws connection: ' +
                    client._socket.remoteAddress+':'+client._socket.remotePort+' -> ' + 
                    client._socket.address().address+':'+client._socket.address().port);
                                
        client.on('message', function(message) {
            var data = (typeof message !== 'string') ? msgpack.decode(message) : JSON.parse(message);
            console.log('business message:'+JSON.stringify(data));
            data += 'reply by A';
    
            try {
                client.send(msgpack.encode(data), function(err){
                    if (err) {
                        console.log(err+',sendOpcMsg failed');
                    }
                });
            } catch (e) {
                console.log(e+',sendOpcMsg failed immediately');
            }
        });
    });
};

// clients A
var nmclnsA = new nmCln({
    srvinfo: {
        timeout: 20,
        endpoints: [{ip: '51dese.com', port: 51686}, {ip: '51dese.com', port: 51868}],
        turn: [
            {ip: '51dese.com', agent: 51866, proxy: 51688} // every turn-server include proxy and agent port
        ]
    },
    usrinfo: {domain: '51dese.com', usrkey: 'A'},
    conmode: SEP.SEP_MODE_CS,
      vmode: vURL.URL_MODE_PATH
});

nmclnsA.on('ready', function(){
    console.log('name-nmclnsA ready');
    
       // create websocket server
    creatNmclnWss(this);
    
    // fake web service
    nmclnsA.bsrv.srv.on('request', function(req, res){
        res.end('Hello, this is A');
    });
    
});

nmclnsA.on('error', function (err) {
    console.log('name client A error: ' + err);
});

process.on('uncaughtException', function (e) {
    console.log('name client exception: ' + e);
});
