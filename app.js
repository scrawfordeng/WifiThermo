var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var temp = require('pi-temperature');
var rpio = require('rpio');

function convertVtoC(value){
  var voltage = (value * 3.3) / 1024;
  
  var ra = ((1/voltage)*3300) - 1000,
      raln = Math.log1p(ra);

  var a =  0.000570569668444, 
    b =  0.000239344111326, 
    c =  0.000000047282773;

  var temp = 1/(a + (b*raln) + (Math.pow(c*raln, 3))),
      tempf = (temp-273.15)*9/5 + 32;
  
  return tempf;
};

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
      
    /*  temp.measure(function(temp){
        var ftemp = temp * 1.8 + 32;
        io.emit('Temp', ftemp);
      }); */

      rpio.spiBegin();

      // Prepare TX buffer [trigger byte = 0x01] [channel 0 = 0x80 (128)] [dummy data = 0x01]
      var sendBuffer = new Buffer([0x01, (8 + 0 << 4), 0x01]); 

      // Send TX buffer to SPI MOSI and recieve RX buffer from MISO
      var receiveBuffer = rpio.spiTransfer(sendBuffer, sendBuffer.length); 

      // Extract value from output buffer. Ignore first byte (junk). 
      var junk = receiveBuffer[0],
          MSB = receiveBuffer[1],
          LSB = receiveBuffer[2];

      io.emit('Temp', convertVtoC(value));

    },500);
  };

  socket.on('disconnect', function(){
    sockets--;
    if(sockets < 1){
      clearInterval(ival);
      ival = null;
      console.log('Stopped polling...')
    };
  });
});

server.listen(3000, function(){
  console.log('listening on port 3000...')
});