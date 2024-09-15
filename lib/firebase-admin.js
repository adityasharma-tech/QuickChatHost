import admin from 'firebase-admin'
import { initializeApp } from 'firebase-admin/app'
import serviceAccount from '../config/fbadmin.creds.json';

const firebase = initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL,
})

export default firebase;