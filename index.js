const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8800;

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to receive Facebook Messenger webhook data
app.post('/webhook', (req, res) => {
  console.log('Received webhook:', JSON.stringify(req.body, null, 2)); // Better readability
  // Respond with a 200 status to acknowledge receipt of the webhook
  res.sendStatus(200);
});

// Endpoint to handle webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verify the token
  if (mode === 'subscribe' && token === '1234567890') { // Ensure this token matches your verification token
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
