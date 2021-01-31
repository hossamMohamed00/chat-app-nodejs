// Require Modules
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

// Load utils functions
const { generateMessage, generateLocationMessage} = require("./utils/messages");
const { addUser,removeUser, getUser, getUsersInRoom  } = require('./utils/users');

// Setup express server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Global Variables
const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

// Serve static files
app.use(express.static(publicDirectoryPath));

// Setup event listener when connection established
// socket --> object contains info about the new connection
io.on("connection", (socket) => {
  console.log("New WebSocket connection!");

  // Listen for the username and room name
  socket.on("join", ({ username, room }, callback) => {
     // Add user
     const { error, user } = addUser({ id: socket.id, username, room })

     // Check if there is error
     if (error) {
         return callback(error); // Notify the user by the acknowledgement 
     }
     
    // Join the given chat room
    socket.join(user.room);

    // Send message event
    socket.emit("message", generateMessage("Admin", "Welcome!"));

    // Broadcast that new user enters the chat room
    // Using socket.broadcast..to(roomName).emit to emit to everybody on that room but that particular connection
    socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`));

    // event when the room changes
    io.to(user.room).emit('roomData', { 
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback(); // without arguments -> without any error
  });

  // listen for send message event
  socket.on("sendMessage", (message, callback) => {
    // Get user
    const user = getUser(socket.id);
    
    // Check if the message contains bad words
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }

    // emit the message (if there is not profanity ) to the specific room
    io.to(user.room).emit("message", generateMessage(user.username ,message));
    // call the callback function to acknowledge the event
    callback();
  });

  // Setup event when the client sent their location
  socket.on("sendLocation", (location, callback) => {
    // get user 
    const user = getUser(socket.id);
    // Send message to all clients
    const locationLink = `https://google.com/maps?q=${location.latitude},${location.longitude}`;
    io.to(user.room).emit("locationMessage", generateLocationMessage(user.username ,locationLink));
    // call the callback function to acknowledge the event
    callback();
  });

  // Setup event to listen when client disconnected
  socket.on("disconnect", () => {
      // remove ths user from the list  
      const user = removeUser(socket.id)
      if (user) {
         // here we will not use the broadcast because the client has disconnected.
         io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left!`));

         io.to(user.room).emit('roomData', {
           room: user.room,
           users: getUsersInRoom(user.room)
         })
      }
  });
});

// Run the server
server.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}!`);
});
