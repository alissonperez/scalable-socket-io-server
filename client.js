let [portSocket] = process.argv.slice(2)
var socket = require('socket.io-client')('http://localhost:' + portSocket);

socket.on('connect', function(){
    console.log('Connnected.')
});

socket.on('event', function(data){
    console.log('Received an event:', data)
    socket.emit('responses', { foo2: 'bar', answerCode: data.answerCode })
});

socket.on('disconnect', function(){
    console.log('Disconnected.')
});
