import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5DMd97VD5YXoQqhUxv58waCLkQVNv0Xs",
  authDomain: "daisy-dayss.firebaseapp.com",
  projectId: "daisy-dayss",
  storageBucket: "daisy-dayss.appspot.com",
  messagingSenderId: "1031333578774",
  appId: "1:1031333578774:web:d3c99772ba542017a70d37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();