import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);

window.auth = auth;
window.db = db;

window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;
window.sendPasswordResetEmail = sendPasswordResetEmail;

window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.collection = collection;
window.addDoc = addDoc;
window.deleteDoc = deleteDoc;
window.updateDoc = updateDoc;
window.getDocs = getDocs;
window.query = query;
window.where = where;
