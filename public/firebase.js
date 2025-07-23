// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAe9jgT1cD0PhRpLGLK8FWmKsK9Lyj8jKs",
  authDomain: "fruit-and-veg-dashboard-v2.firebaseapp.com",
  projectId: "fruit-and-veg-dashboard-v2",
  storageBucket: "fruit-and-veg-dashboard-v2.firebasestorage.app",
  messagingSenderId: "742156994835",
  appId: "1:742156994835:web:2aa617429b65f8717eb2e6"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
