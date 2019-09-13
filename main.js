//-------------------------
// MAIN file of socket.io
//-------------------------

const APP = require('express')();
const SERVER = require('http').createServer(APP);
const IO = require('socket.io')(SERVER);

APP.get('/my-namespace1', (req, res, next) => {
	res.sendFile(__dirname + '/index.html');
});

APP.get('/my-namespace2', (req, res, next) => {
	res.sendFile(__dirname + '/index1.html');
});

//code for namespace 1
let rooms = ['room1', 'room2'];
let nsp1 = IO.of('/my-namespace1');
nsp1.on('connect', function (client) {
	console.log('someone connected to namespace 1 with id: ', client.id);
	client.on('message-client', (user_name, message) => {
		if ((user_name != "") || (message != "")) {
			let msg = user_name + ': says ' + message + "";
			client.broadcast.emit('message-server', msg);
		}
	});
	client.on('message-client-grp1', (user_name, message) => {
		if ((user_name != "") || (message != "")) {
			let msg = user_name + ': says ' + message + "";
			client.to('room1').emit('message-server', msg, 'room1');
		}
	});
	client.on('message-client-grp2', (user_name, message) => {
		if ((user_name != "") || (message != "")) {
			let msg = user_name + ': says ' + message + "";
			client.to('room2').emit('message-server', msg, 'room2');
		}
	});
	client.on('join-room', (user_name, room) => {
		if ((rooms.includes(room)))
			client.join(room, (err) => {
				if (!err) {
					client.to(room).emit('message-server', user_name + ' joined ' + room);
				}
			});
		else
			console.log('no such room found');
	});
});

//code for namespace 2
let nsp2 = IO.of('/my-namespace2');
nsp2.on('connect', function (client) {
	console.log('someone connected to namespace 2 with id: ', client.id);
	client.on('message-client', (user_name, message) => {
		if ((user_name != "") || (message != "")) {
			let msg = user_name + ': says ' + message + "";
			client.broadcast.emit('message-server', msg);
		}
		client.on('message-client-grp1', (user_name, message) => {
			if ((user_name != "") || (message != "")) {
				let msg = user_name + ': says ' + message + "";
				client.to('room1').emit('message-server', msg);
			}
		});
		client.on('message-client-grp2', (user_name, message) => {
			if ((user_name != "") || (message != "")) {
				let msg = user_name + ': says ' + message + "";
				client.to('room2').emit('message-server', msg);
			}
		});
	});

	client.on('join-room', (room) => {
		if ((rooms.includes(room)))
			client.join(room, (err) => {
				if (!err) {
					client.emit('message-server', 'a user joined ' + room);
				}
			});
		else
			console.log('no such room found');
	});
});

SERVER.listen(4000, () =>{
	console.log('listening on port 4000');
});