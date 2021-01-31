/* This file will keep track of the users and rooms  */
const users = [];

// addUser -> to track that user
const addUser = ({ id, username, room }) => {
   // Clean the data
   username = username.trim().toLowerCase();
   room = room.trim().toLowerCase();

   // Validate the data
   if (!username || !room) {
      return {
         error: 'Username and Room are required'
      }
   }

   // Check for existing users
   const existingUser = users.find((user) => {
      return user.room === room && user.username === username;
   })

   // Validate username 
   if(existingUser) {
      return {
         error: 'Username is in use!'
      }
   }

   // Store the user
   const user = { id, username, room };
   users.push(user)

   return {user};
}

// removeUser -> to stop tracking that user
const removeUser = (id) => {
   // Find the user
   const userIndex = users.findIndex(user => user.id === id);
   // Remove the user
   if (userIndex !== -1) {
      return users.splice(userIndex, 1)[0]
   }
}

// getUser -> fetch existing user data
const getUser = id => users.find((user) => user.id === id);

// getUsersInRoom -> Get list of all users in that room
const getUsersInRoom = room => users.filter(user => user.room === room.trim().toLowerCase());

module.exports = {
   addUser,
   removeUser,
   getUser,
   getUsersInRoom
}