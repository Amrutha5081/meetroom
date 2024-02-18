import { initializeApp } from "firebase/app";
import{getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAxR4kY29-r3RTsLOyWwAp1wTwo076Cv3s",
  authDomain: "loginpage-5391b.firebaseapp.com",
  projectId: "loginpage-5391b",
  storageBucket: "loginpage-5391b.appspot.com",
  messagingSenderId: "792070582847",
  appId: "1:792070582847:web:e4e79db497b678099efe8a",
  measurementId: "G-VR1BGLXCQV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;