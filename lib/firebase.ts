const firebaseConfig = {
  apiKey: "AIzaSyCiQ6s-6d592Ml24FO8hyw1Ym2glGSM5mQ",
  authDomain: "kaidenz.firebaseapp.com",
  projectId: "kaidenz",
  storageBucket: "kaidenz.firebasestorage.app",
  messagingSenderId: "982750705564",
};

// Fully lazy — no Firebase module is loaded until these are called (client-side only)
let _app: unknown = null;
let _auth: unknown = null;
let _db: unknown = null;

async function getFirebaseApp() {
  if (!_app) {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

export async function getFirebaseAuth() {
  if (!_auth) {
    const app = await getFirebaseApp();
    const { getAuth } = await import("firebase/auth");
    _auth = getAuth(app as import("firebase/app").FirebaseApp);
  }
  return _auth as import("firebase/auth").Auth;
}

export async function getFirebaseDb() {
  if (!_db) {
    const app = await getFirebaseApp();
    const { getFirestore } = await import("firebase/firestore");
    _db = getFirestore(app as import("firebase/app").FirebaseApp);
  }
  return _db as import("firebase/firestore").Firestore;
}

export { firebaseConfig };
