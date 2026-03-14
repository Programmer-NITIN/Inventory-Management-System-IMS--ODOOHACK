const admin = require('firebase-admin');
const env = require('./env');

let serviceAccount;
try {
  serviceAccount = require('./firebase-service-account.json');
} catch (error) {
  console.warn('⚠️ firebase-service-account.json not found in src/config/. Falling back to env variables.');
  serviceAccount = {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY,
  };
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin. Check your firebase-service-account.json file or environment variables.');
    // Don't crash the server, but API calls requiring auth will fail
  }
}

module.exports = admin;
