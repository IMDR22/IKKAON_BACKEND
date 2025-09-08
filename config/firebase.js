const admin = require('firebase-admin');

const serviceAccount = require('../iikaon-preorder-firebase-adminsdk-fbsvc-e2286f5920.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports = admin;
