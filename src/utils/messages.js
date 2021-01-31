/* This file focus on defining a few functions */
const generateMessage = (username, text) => {
   return {
      username,
      text,
      createdAt: new Date().getTime()
   }
}

const generateLocationMessage = (username, url) => {
   return {
      username,
      location: url,
      createdAt: new Date().getTime()
   }
}

module.exports = {
   generateMessage,
   generateLocationMessage
}