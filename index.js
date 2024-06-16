const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8800;
const PAGE_ACCESS_TOKEN = 'your_page_access_token';  // Replace with your actual Page Access Token

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Function to send messages to Facebook
const sendMessage = (recipientId, messageText) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
    },
  };

  axios.post(`https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
    .then(response => {
      console.log('Message sent successfully:', response.data);
    })
    .catch(error => {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    });
};

// Endpoint to receive Instagram and Facebook webhook data
app.post('/webhooks', (req, res) => {
  const body = req.body;

  console.log('Received webhook:', JSON.stringify(body, null, 2));

  if (body.object === 'instagram') {
    body.entry.forEach(entry => {
      const { id, time, messaging } = entry;
      messaging.forEach(event => {
        if (event.message) {
          console.log('Instagram Message received: ', JSON.stringify(event.message, null, 2));
        } else {
          console.log('Instagram Event received: ', JSON.stringify(event, null, 2));
        }
      });
    });
  } else if (body.object === 'page') {
    body.entry.forEach(entry => {
      const { id, time, messaging } = entry;
      messaging.forEach(event => {
        if (event.message) {
          const senderId = event.sender.id;
          const messageText = event.message.text;
          console.log('Facebook Message received: ', JSON.stringify(event.message, null, 2));

          // Store the senderId and messageText for later use
          // You may want to store this in a database or in-memory storage
          // For simplicity, we're just logging it here
          console.log('Storing senderId and messageText:', senderId, messageText);
        } else {
          console.log('Facebook Event received: ', JSON.stringify(event, null, 2));
        }
      });
    });
  } else {
    console.log('Received webhook data - different:', JSON.stringify(body, null, 2));
  }

  // Respond with a 200 status to acknowledge receipt of the webhook
  res.sendStatus(200);
});

// Endpoint to handle webhook verification
app.get('/webhooks', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verify the token
  if (mode === 'subscribe' && token === '1234567890') {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Endpoint to receive reply messages from the website
app.post('/send-reply', (req, res) => {
  const { recipientId, messageText } = req.body;

  if (!recipientId || !messageText) {
    return res.status(400).send('recipientId and messageText are required');
  }

  sendMessage(recipientId, messageText);

  res.status(200).send('Message sent');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
