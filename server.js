var util = require('util');
var fs = require('fs');
var WebSocketServer = require('ws').Server;
var domain = require('domain');
var http = require('http');
var Router = require('node-simple-router');
var file = require('file');
var escape = require('escape-html');
var router = Router();


var button = '<button>BUTTON</button>';
var picture = '<img src="$1"/>';
var marquee = '<marquee direction="$2">$1</marquee>';

var handleReq = function (request) {
  var req = JSON.parse(request);
  if (req.text === "button") {
    return button;
  } else if (req.text === "image") {
    return picture.replace('$1', req.options[0])
  } else if (req.text === "marquee") {
    return marquee.replace('$1', req.options[0]).replace('$2', req.options[1])
  } else {
    return escape('Command: ' + (req.text || '<Not Specified>') + ' not found.');
  }
};

d = domain.create();
d.on('error', function (err) {
  console.error(err);
});

var wss = new WebSocketServer({
  port: 8081
});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    // ws.send();
    // ws.send(message);
    ws.send(handleReq(message));
  });

  ws.on('close', function () {
    var i = wss.clients.indexOf(ws);
    if (wss.clients.indexOf(ws) > -1) {
      delete wss.clients[i];
    }
  });

  ws.on('error', function (err) {
    console.log(err);
  });
});


router.get("/", function (request, response) {
  fs.readFile('./index.html', function (err, html) {
    if (err) throw err;
    response.writeHeader(200, {
      "Content-Type": "text/html",
      'Content-Length': html.length,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    });
    response.write(html);
    response.end();
  });
});

var server = http.createServer(router);
// Listen on port 8080 on localhost
server.listen(8080, "localhost");

console.log('server running on 8080')
