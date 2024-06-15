const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8800;

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to receive Instagram webhook data
app.post('/igwebhooks', (req, res) => {
  const body = req.body;

  console.log('Received webhook:', JSON.stringify(body, null, 2));

  // Check if this is an Instagram message
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
  } else {
    console.log('Received webhook data - different:', JSON.stringify(body, null, 2));
  }

  // Respond with a 200 status to acknowledge receipt of the webhook
  res.sendStatus(200);
});

// Endpoint to handle webhook verification
app.get('/igwebhooks', (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
