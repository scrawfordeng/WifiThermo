var express = require('express');
var Mcp3008 = require('./mcp3008.js');

var app = express();

var adc = new Mcp3008();
var channel = 0;


app.get('/', function(req, res){
  adc.read(channel, function(value){
    if(value){
      res.send(value);
    } else{
      res.send('No value');
    }

  });
});

app.listen(3000, function(){
  console.log('listening on port 3000...')
});