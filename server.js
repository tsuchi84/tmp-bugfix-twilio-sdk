const express = require("express");
const ClientCapability = require('twilio').jwt.ClientCapability;
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

app.use(express.static('./dist'));

// create token
app.get('/token', (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const appSid = process.env.TWILIO_APP_SID;
  const clientUser = process.env.TWILIO_CLIENT_USER;

  const capability = new ClientCapability({
    accountSid: accountSid,
    authToken: authToken,
  });
  capability.addScope(new ClientCapability.OutgoingClientScope({ applicationSid: appSid, clientName: clientUser }));
  capability.addScope(new ClientCapability.IncomingClientScope(clientUser));
  const token = capability.toJwt();

  console.log({accountSid, authToken, appSid, clientUser}, token);

  res.set('Content-Type', 'application/jwt');
  res.send(token);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// TwiML App Callback
app.post('/outbound', (req, res) => {
  const response = new VoiceResponse();

  const dial = response.dial({
    callerId: req.body.number
  });
  dial.number(req.body.to);

  console.log(req.body, response.toString());

  res.set('Content-Type', 'application/xml');
  res.send(response.toString());
});

const server = app.listen(3000, function(){
  console.log("Node.js is listening to PORT:" + server.address().port);
});
