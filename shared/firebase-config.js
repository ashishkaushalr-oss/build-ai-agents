/* Firebase web app config for account sync (Google sign-in + Firestore) when the course runs outside Claude.
   Paste the object from the Firebase console: Project settings > General > Your apps > SDK setup and configuration > Config.
   Leave it null to run without sign-in; progress then stays in the visitor's browser.
   The web API key is public by design: access to data is controlled by firebase/firestore.rules, not by the key. */
window.FIREBASE_CONFIG = null;
