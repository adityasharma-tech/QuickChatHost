// index.js
const express = require('express')
const { initializeApp } = require('firebase-admin/app');
const admin = require('firebase-admin')
const { json } = require('body-parser')
const cors = require('cors')
require('dotenv').config();
const serviceAccount = require('./fbadmin.creds.json')
const { getMessaging } = require('firebase-admin/messaging')

const app = express();
app.use(cors());
app.use(json());

const fbapp = initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
  });

app.get('/', (req, res)=>{
  res.send({ message: "All good" });
})

app.post('/message', (req, res) => {
  const { fcm_token, content } = req.body;
  if(!fcm_token) throw new Error('fcm_token required');
  const message = {
    data: content,
    token: fcm_token,
    notification: {
      title: content?.phoneNumber,
      body: content?.message
    }
  };

  getMessaging(fbapp).send(message)
  .then((res)=>console.log(res)).catch(err=>console.error(err));

  res.send({ message: 'Message sent' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});