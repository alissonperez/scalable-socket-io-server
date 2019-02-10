var cuid = require('cuid');
var notepack = require('notepack.io');

const processCode = cuid()  // Our process code, used to create a patter channel

let [portHttp, portSocket] = process.argv.slice(2)

// ==================== PUBSUB library
// Used to send message received from Redis to our pending request in this process

const pubsub = require('pubsub-js');

// ==================== REDIS Pub sub between socket io servers (by hand)

const redis = require('redis')
var sub = redis.createClient(), pub = redis.createClient();

// Here we receive our messages from redis and forward then to
// our http requests waiting for its answers.
sub.on('pmessage_buffer', function(pattern, channel, message) {
    const decoded = notepack.decode(message)
    console.log('RECEIVED from Redis:', pattern, '/', channel, ':', decoded)
    pubsub.publish(decoded.answerCode, decoded)
})

// Create a channel exclusive for this process
sub.psubscribe(`answers/${processCode}/*`)

// ==================== SOCKET IO

const redisAdapter = require('socket.io-redis');

var io = require('socket.io')(portSocket);
io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

io.on('connection', function(socket){
    console.log('a user connected: ' + socket.id);

    // Here, we will receive our message from our socket and forward then to
    // our http request waiting for it OR send it to it's redis channel.
    socket.on('responses', function(data) {
	console.log('RECEIVED from Socket:', data)
	if (!pubsub.publish(data.answerCode, data)) {
	    console.log('Not in this process, sending it to redis channel')
	    pub.publish(`answers/${data.answerCode}`, notepack.encode(data))
	}
	else {
	    console.log('Found in this process. No need to send it to redis')
	}
    })
});

// ==================== HTTP

var express = require('express');
var app = express();

// Requests from our crawler clients. For tests proposes, we need to receive socket id
// in path params
app.get('/:id', function (req, res) {
    const answerCode = `${processCode}/${cuid()}`
    const token = pubsub.subscribe(answerCode, function(msg, data) {
	console.log('msg: ', msg, 'data:', data)
	res.end('ok')
	pubsub.unsubscribe(token)
    })

    console.log('Received an event to: ', req.params.id)
    io.to(req.params.id).emit('event', { answerCode, foo: 'bar' })
});

app.listen(portHttp, function () {
  console.log(`Example app listening on port ${portHttp}!`);
});
