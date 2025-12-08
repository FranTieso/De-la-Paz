// src/config/firebase.js
import admin from 'firebase-admin'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Ruta al JSON de la cuenta de servicio
const serviceAccountPath = resolve('firebase-service-account.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const db = admin.firestore()

export { db }
