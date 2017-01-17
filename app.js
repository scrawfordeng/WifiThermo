var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var temp = require('pi-temperature');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var ival = null;
var sockets = 0;

io.on('connection', function(socket){
  
  sockets++;
  
  if(ival === null){
    console.log('Started polling...');
    ival = setInterval(function(){
      temp.measure(function(temp){
        var ftemp = temp * 1.8 + 32;
        io.emit('Temp', ftemp);
      });
    }, 500);
  };

  socket.on('disconnect', function(){
    sockets--;
    if(sockets < 1){
      clearInterval(ival);
      ival == null;
      console.log('Stopped polling...')
    };
  });
});

server.listen(3000, function(){
  console.log('listening on port 3000...')
});