const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8800;
const PAGE_ACCESS_TOKEN = 'EAAN8HHlcYXwBOzYjxEVEIeZAulUyRthICoNHOhTlMkZAZB0cjh8yrD3exs7eh9SUSdnTR1pHYqFs7x8s5chN8owU0p7u337JGEDNKujJ5Qii4KZCouQioWjkO2m75JcDyZCExf8ER4nC8cMycSFGQeCtYZCWiW2KUOuVh14ZCzdDGuZBjys1cOSry4uWRRFmZAMxpIAZDZD';  // Replace with your actual Page Access Token

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

// Function to get user profile details from Facebook
const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`https://graph.facebook.com/${userId}`, {
      params: {
        access_token: PAGE_ACCESS_TOKEN,
        fields: 'first_name,last_name,profile_pic',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response ? error.response.data : error.message);
    return null;
  }
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
    body.entry.forEach(async entry => {
      const { id, time, messaging } = entry;
      messaging.forEach(async event => {
        if (event.message) {
          const senderId = event.sender.id;
          const messageText = event.message.text;
          console.log('Facebook Message received: ', JSON.stringify(event.message, null, 2));

          // Fetch user profile details
          const userProfile = await getUserProfile(senderId);
          if (userProfile) {
            console.log('User Profile:', userProfile);

            // Store the user profile details (for now, just log them)
            // You can replace this with your database storage logic
            // For example, store in a database
            // await saveUserProfileToDatabase(userProfile);
          }

          // You can also respond to the message if needed
          // sendMessage(senderId, `Hello ${userProfile.first_name}, you said: "${messageText}".`);
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
