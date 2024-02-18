import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";

const userAuthContext = createContext();
const handleAuthError = (error, isSignUp) => {
  console.log("error handling start");
  if (error.code === 'auth/email-already-in-use') {
    alert('Email already in use!');
  } else if (error.code === 'auth/network-request-failed') {
    alert('Without network connection!');
  } else if (error.code === 'auth/invalid-email') {
    alert('Invalid format! Please enter valid credentials');
  } else if (error.code === 'auth/weak-password') {
    alert('Password is too weak! Please use a stronger password with a minimum of 6 characters');
  } else if (error.code === 'auth/invalid-credential') {
    alert('Invalid credentials, please try again!');
  } else if (error.code === 'auth/wrong-password') {
    alert('The password you entered is incorrect');
  } else if (error.code === 'auth/user-not-found') {
    alert('User with this email does not exist');
  } else if (error.code === 'auth/missing-password') {
    alert('Password missing, please enter the password');
  } else {
    if (isSignUp) {
      alert('Signup failed! Please try again.');
    } else {
      alert('Login failed! Please try again.');
    }
  }

  // Re-throw the error to allow further handling if needed
  throw error;
};

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState({});
  
// Function to handle login
function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return userCredential;
    })
    .catch((error) => handleAuthError(error, false));
}

function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return userCredential;
    })
    .catch((error) => handleAuthError(error, true));
}
  function logOut() {
    return signOut(auth);
  }
  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
      console.log("Auth", currentuser);
      setUser(currentuser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <userAuthContext.Provider
      value={{ user, logIn, signUp, logOut, googleSignIn }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}