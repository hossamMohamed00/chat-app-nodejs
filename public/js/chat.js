/* 
   This loaded from the client side of the socket.io
   Connect to the server
   socket will allow us to send and receive events
*/
const socket = io();

/* Elements */
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

/* Template */
const messageTemplate = document.querySelector('#message-template').innerHTML;
const messageLocationTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

/* Options */
// Parse the QS to get the username and room name 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Add Auto-Scrolling
const autoScroll = () => {
  // Get New Message Element
  const $newMessage = $messages.lastElementChild;

  // Get the Height of the last (new) message
  const newMessageStyles = getComputedStyle($newMessage); // to know the margin bottom spacing value is ?
  const newMessageMargin = parseInt(newMessageStyles.marginBottom); // Convert from String -> Int
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin; // this get the height of the message (but not taking into account the margin)

  // Visible Height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight; //get the total height we are able to scroll

  // How fat have I scrolled ?
  // we wanna to how far from the button we are ?
  /**
   * scrollTop : return number the amount of distance we've scrolled from the top
   */
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
      $messages.scrollTop = $messages.scrollHeight
  }
} 

// Listen for the message event
socket.on('message', (message) => {

   console.log(message);
   // Render the messages on the UI
   const html = Mustache.render(messageTemplate,{
      username: message.username,
      message: message.text,
      createdAt: moment(message.createdAt).format('h:mm a')
   }); // compile the template and add the data 
   
   $messages.insertAdjacentHTML('beforeend', html);
   
   // Call auto-scrolling messages
   autoScroll()
})

// Listen for the location message event
socket.on('locationMessage', (message) => {
  // Render the location messages on the UI
  const html = Mustache.render(messageLocationTemplate, {
    username: message.username,
    location: message.location,
    createdAt: moment(message.createdAt).format("h:mm a"),
  }); // compile the template and add the data

  $messages.insertAdjacentHTML("beforeend", html);

  // Call auto-scrolling messages
  autoScroll();
})

// Send the message to the other clients
$messageForm.addEventListener('submit', (event) => {
   event.preventDefault();

   // Disable the submit button 
   $messageFormButton.setAttribute('disabled', 'disabled');

   const message = event.target.elements.Message.value;
   
   socket.emit('sendMessage', message, (error) => {
   /* This function will be called when the event is acknowledge */

      // Re-Enable the submit button
      $messageFormButton.removeAttribute('disabled');
      $messageFormInput.value = '';
      $messageFormInput.focus();

      if(error) {
         return alert(error)
      }

      console.log('Message delivered!');
   }); 
})

// Add event on share location
$sendLocationButton.addEventListener('click',() => {
   // Use the geo location api   
   if(!navigator.geolocation) {
      return alert('Geolocation is not supported by your browser');
   } 
   // Disable the send location button
   $sendLocationButton.setAttribute('disabled', 'disabled');

   // this method doesn't support promises
   navigator.geolocation.getCurrentPosition((position) => {
      //emit the location coords to the server
      const longitude = position.coords.longitude;
      const latitude = position.coords.latitude;
      socket.emit('sendLocation', {longitude, latitude}, () => {
         // This function will be called when the event is acknowledge

         // Re-Enable the send location button
         $sendLocationButton.removeAttribute('disabled');

         console.log("Location Shared!");
      });
   })
})

// Send the username and room name to the server
socket.emit('join', {username, room}, (error) => {
   if(error) {
      alert(error);
      location.href = '/'
   }
})

// Listen for event when the list on the room changes
socket.on('roomData', ({ room, users }) => {
   const html = Mustache.render(sidebarTemplate, {
      room,
      users
   })

   document.querySelector('#sidebar').innerHTML = html
})