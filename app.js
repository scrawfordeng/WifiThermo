var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var temp = require('pi-temperature');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  setInterval(function(){
    temp.measure(function(temp){
      var ftemp = temp * 1.8 + 32;
      io.emit('Temp', ftemp);
    });
  }, 500);
});

server.listen(3000, function(){
  console.log('listening on port 3000...')
});