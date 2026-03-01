// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBELkP5rJfJTw5rE2IGq0wNFKQz2FVolzs",
  authDomain: "projectfeedbackapp.firebaseapp.com",
  projectId: "projectfeedbackapp",
  storageBucket: "projectfeedbackapp.firebasestorage.app",
  messagingSenderId: "584976727117",
  appId: "1:584976727117:web:1c2c1710bfb60b474eb004",
  measurementId: "G-133ZK25YLS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);