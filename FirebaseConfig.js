// FirebaseConfig.js
import { initializeApp } from 'firebase/app';
import { signOut, sendPasswordResetEmail,initializeAuth, getReactNativePersistence, signInWithEmailAndPassword as signIn ,createUserWithEmailAndPassword as createUser,sendEmailVerification} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
  apiKey: "AIzaSyCOY1xtvUQ1TokDohvxm_iQ1qalYNdUkxY",
  authDomain: "first-step-3b188.firebaseapp.com",
  projectId: "first-step-3b188",
  storageBucket: "first-step-3b188.appspot.com",
  messagingSenderId: "240200997505",
  appId: "1:240200997505:web:b1165de49a7ac4859b0b80",
  measurementId: "G-SJNQ609DMD"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, signIn ,createUser,sendEmailVerification,db,sendPasswordResetEmail,signOut };
