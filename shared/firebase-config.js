/* Firebase web app config for account sync (Google sign-in + Firestore) when the course runs outside Claude.
   It comes from the Firebase console: Project settings > General > Your apps > SDK setup and configuration > Config.
   Only the { ... } part goes here, assigned to window.FIREBASE_CONFIG; set it to null to run without sign-in,
   and progress then stays in the visitor's browser.
   The web API key is public by design: access to data is controlled by firebase/firestore.rules, not by the key. */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCVtzJrnmAp4Wp0AuNzEt1An5jJTEQMQhg",
  authDomain: "build-ai-agents-1ffed.firebaseapp.com",
  projectId: "build-ai-agents-1ffed",
  storageBucket: "build-ai-agents-1ffed.firebasestorage.app",
  messagingSenderId: "92919910448",
  appId: "1:92919910448:web:05107cc094b9ccf6921df5"
};
