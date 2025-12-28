const net = require('net');


net.createServer((socket) => {
    console.log('Client connected');
    socket.on('data', (data) => {
        console.log(data.toString());
    });
    socket.on('end', () => {
        console.log('Client disconnected');
    });
}).listen(9000, () => {
    console.log('Server is running on port 9000');
});