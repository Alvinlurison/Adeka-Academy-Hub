import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyBmsSCbPmXCk4nPZAXKfZVZrjEn9x_cwGA",
authDomain: "adecomm-hub.firebaseapp.com",
projectId: "adecomm-hub",
storageBucket: "adecomm-hub.firebasestorage.app",
messagingSenderId: "771891537050",
appId: "1:771891537050:web:5dae9122bb30513f85ab23"
  
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.auth = auth;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;
