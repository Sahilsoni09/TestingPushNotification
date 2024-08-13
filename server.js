// const express = require('express');
// const axios = require('axios');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const app = express();
// const port = 3000;

// let dispatchResponse = null;

// app.use(cors({
//   origin: '*',
//   allowedHeaders: ['Content-Type']
// }));

// app.use(bodyParser.json());

// app.post('/send-notification', async (req, res) => {
//   const { to, title, body, data } = req.body;

//   try {
//     const response = await axios.post('https://exp.host/--/api/v2/push/send', {
//       to,
//       title,
//       body,
//       data,
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error('Error sending push notification:', error);
//     res.status(500).send('❌ Failed to send notification');
//   }
// });

// app.post('/dispatch', (req, res) => {
//   const { response } = req.body;
//   console.log('Response:', response);
//   dispatchResponse = response; // Store the response
//   res.json({ message: 'Dispatch response received', data: response });
// });

// app.get('/dispatch-response', (req, res) => {
//   res.json({ response: dispatchResponse });
// });

// app.get('/', (req, res) => {
//   res.send('Server is running');
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo();

const app = express();
const port = 3000;

let dispatchResponse = null;
let expoPushToken = null;

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());


// Endpoint to register the token
app.post('/register-token', (req, res) => {
  const { token } = req.body;

  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).send('Invalid Expo push token');
  }

  // Store the token if it doesn't exist already
  if (!expoPushToken.includes(token)) {
    expoPushToken = token;
  }

  res.status(200).send('Token registered successfully');
});

// Endpoint to retrieve all tokens (for demonstration purposes)
app.get('/tokens', (req, res) => {
  res.json({ tokens: expoPushToken });
});

app.post('/send-notification', async (req, res) => {
  const { to, title, body, data } = req.body;
  
  if (!Expo.isExpoPushToken(to)) {
    console.error(`Push token ${to} is not a valid Expo push token`);
    return res.status(400).send('Invalid Expo push token');
  }
  
  let messages = [{
    to,
    sound: 'default',
    title,
    body,
    data,
  }];
  
  try {
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
    
    res.json(tickets);
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).send('❌ Failed to send notification');
  }
});

app.post('/dispatch', (req, res) => {
  const { response } = req.body;
  console.log('Response:', response);
  dispatchResponse = response; // Store the response
  res.json({ message: 'Dispatch response received', data: response });
});

app.get('/dispatch-response', (req, res) => {
  res.json({ response: dispatchResponse });
}); 

app.get('/', (req, res) => {
  res.send('Server is running');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
