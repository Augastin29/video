console.log('hjj')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = 3000
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
var user = {}
// app.get('/',(req,res)=>{
//     res.sendFile('G:/node/socketchat/public/chat.html')
// })
const rooms = { name: {} };
app.get('/', (req, res) => {
    res.render('index', { rooms: rooms })
});
app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/');
    };
    res.render('room', { roomName: req.params.room });
    io.emit('roomcreated', req.params.room);// i am change that code today
})
app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        res.render('/')
    }
    rooms[req.body.room] = { user: {} }
    res.redirect(req.body.room)

})
var user = {}
io.on('connection', socket => {
    // socket.broadcast.emit('user','new user connected')
    socket.on('username', (room, name) => {
        socket.join(room);
        rooms[room].user[socket.id] = name;
        const targetRoom = io.sockets.adapter.rooms.get(room);
        console.log('target', targetRoom)
        if (targetRoom) {
            io.to(room).emit('sent-username', name);
        } else {
            console.error(`Room ${room} not found.`);
        }
    });


    socket.on('inputmsg', (room, data) => {
        console.log('usermsg', room, data);
        const targetRoom = io.sockets.adapter.rooms.get(room);
        if (targetRoom) {
            socket.to(room).emit('sentmsg', { message: data, name: rooms[room].user[socket.id] });
            console.log('usemsg', user);
        } else {
            console.error(`Room ${room} not found.`);
        }
    });

    // any one client leave the application diconnect event emit 
    socket.on('disconnect', () => {
        getuserrooms(socket).forEach(room => {
            io.to(room).emit('userDisconnect', rooms[room].user[socket.id]);
            console.log('deletedid', rooms[room].user[socket.id])
            delete rooms[room].user[socket.id], socket.id;

        });
    });


})


function getuserrooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room && room.user && room.user[socket.id] != null) {
            names.push(name);
        }
        return names;
    }, []);
}



http.listen(port, () => {
    console.log(`app is runing in port ${port}`)
})
// const express = require('express');
// const app = express();
// const http = require('http').Server(app);
// const io = require('socket.io')(http);
// const port = 3000;
// const amqp = require('amqplib/callback_api');  // Require RabbitMQ library

// app.set('views', './views');
// app.set('view engine', 'ejs');
// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));

// const rooms = { name: {} };
// function publishToRabbitMQ(room, msg, username) {
//     if (channel) {
//       const message = JSON.stringify({ room, msg, username });
//       channel.publish(exchange, '', Buffer.from(message));
//       console.log('Published message to RabbitMQ:', message);
//     } else {
//       console.error('Channel is not initialized.');
//     }
//   }

// app.get('/', (req, res) => {
//   res.render('index', { rooms: rooms });
// });

// app.get('/:room', (req, res) => {
//   if (rooms[req.params.room] == null) {
//     return res.redirect('/');
//   }
//   res.render('room', { roomName: req.params.room });
// });

// app.post('/room', (req, res) => {
//   if (rooms[req.body.room] != null) {
//     res.redirect('/');
//   } else {
//     rooms[req.body.room] = { user: {} };
//     res.redirect(req.body.room);
//   }
// });

// io.on('connection', (socket) => {
//   socket.on('username', (room, name) => {
//     socket.join(room);
//     rooms[room].user[socket.id] = name;
//     io.to(room).emit('sent-username', name);
//   });

//   socket.on('inputmsg', (room, data) => {
//     console.log('usermsg', room, data);
//     if (rooms[room]) {
//       socket.to(room).emit('sentmsg', { message: data, name: rooms[room].user[socket.id] });
//       // Publish message to RabbitMQ exchange
//       publishToRabbitMQ(room, data, rooms[room].user[socket.id]);
//     } else {
//       console.error(`Room ${room} not found.`);
//     }
//   });

//   socket.on('disconnect', () => {
//     getuserrooms(socket).forEach((room) => {
//       io.to(room).emit('userDisconnect', rooms[room].user[socket.id]);
//       delete rooms[room].user[socket.id];
//     });
//   });
// });

// // Function to retrieve user rooms
// function getuserrooms(socket) {
//   return Object.entries(rooms).reduce((names, [name, room]) => {
//     if (room && room.user && room.user[socket.id] != null) {
//       names.push(name);
//     }
//     return names;
//   }, []);
// }

// http.listen(port, () => {
//   console.log(`App is running on port ${port}`);
// });

// // RabbitMQ setup and connection
// amqp.connect('amqp://localhost', (err, connection) => {
//   if (err) {
//     throw err;
//   }

//   connection.createChannel((err, channel) => {
//     if (err) {
//       throw err;
//     }

//     // RabbitMQ exchange for fanout messaging
//     const exchange = 'chat_exchange';
//     channel.assertExchange(exchange, 'fanout', { durable: false });

//     // Function to publish a message to RabbitMQ
//     // function publishToRabbitMQ(room, msg, username) {
//     //   const message = JSON.stringify({ room, msg, username });
//     //   channel.publish(exchange, '', Buffer.from(message));
//     //   console.log('Published message to RabbitMQ:', message);
//     // }

//     // Setup RabbitMQ consumer to listen to messages
//     channel.assertQueue('', { exclusive: true }, (err, q) => {
//       if (err) {
//         throw err;
//       }

//       console.log('Waiting for messages in queue:', q.queue);

//       // Bind queue to the exchange
//       channel.bindQueue(q.queue, exchange, '');

//       // Consume messages from RabbitMQ and emit to Socket.io
//       channel.consume(q.queue, (msg) => {
//         if (msg.content) {
//           const { room, msg: message, username } = JSON.parse(msg.content.toString());
//           io.to(room).emit('sentmsg', { message, name: username });
//           console.log('Received and emitted message:', msg.content.toString());
//         }
//       }, { noAck: true });
//     });
//   });
// });




