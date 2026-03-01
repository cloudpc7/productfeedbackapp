import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Standard Node.js boilerplate to handle file paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. Path to your service account and data
const serviceAccount = JSON.parse(await readFile(join(__dirname, './service-account.json'), 'utf8'));
const dataPath = join(__dirname, './data.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDatabase() {
  try {
    // 2. Read and Parse the JSON file
    const rawData = await readFile(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    const batch = db.batch();

    // 3. Process the Current User
    const userRef = db.collection('users').doc('currentUser');
    batch.set(userRef, data.currentUser);

    // 4. Process the Product Requests
    data.productRequests.forEach((item) => {
      // Use the numeric ID from the JSON as the Document Name
      const docRef = db.collection('productRequests').doc(item.id.toString());
      batch.set(docRef, item);
    });

    // 5. Commit the entire batch
    await batch.commit();
    console.log('Successfully migrated data.json to Firestore! 🚀');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

seedDatabase();