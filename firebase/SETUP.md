# Account sync: Google sign-in for the course site

On the web the course keeps a learner's progress in their browser. With Firebase connected, a **Sign in with Google** button appears in every page header and progress follows the learner across devices: hub ticks, concepts, notes, the module checklists and quiz scores. Inside Claude nothing changes; the hub keeps using Claude's own account sync.

Setting it up takes about ten minutes in the Firebase console and costs nothing at course scale (the free plan allows tens of thousands of reads and writes a day).

## 1. Create the project

1. Go to https://console.firebase.google.com and sign in with the Google account that should own the project.
2. **Create a project.** Name it, for example `build-ai-agents`. Google Analytics can stay off.

## 2. Turn on Google sign-in

1. In the left menu, **Build**, then **Authentication**, then **Get started**.
2. **Sign-in method** tab, choose **Google**, switch **Enable** on, pick a support email, **Save**.
3. **Settings** tab, **Authorized domains**, **Add domain**: add `ashishkaushalr-oss.github.io`. Add the Intuit Pages host too once it exists. `localhost` is already there for local testing.

## 3. Create the database

1. **Build**, then **Firestore Database**, then **Create database**.
2. Pick a location close to most learners (any is fine), choose **Start in production mode**, **Create**.
3. **Rules** tab: replace the contents with the file `firebase/firestore.rules` from this repository, then **Publish**. The rule lets each signed-in person read and write only their own document and nothing else.

## 4. Register the web app and copy its config

1. **Project settings** (the gear next to Project Overview), **General** tab, scroll to **Your apps**, click the web icon (`</>`).
2. Nickname, for example `course site`. Leave Firebase Hosting unticked. **Register app**.
3. Under **SDK setup and configuration** choose **Config** and copy the object. It looks like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "build-ai-agents.firebaseapp.com",
  projectId: "build-ai-agents",
  storageBucket: "build-ai-agents.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

The `apiKey` here is not a secret. It only identifies the project; what anyone can do with the data is decided by the rules you published in step 3.

## 5. Put the config in the course

Open `shared/firebase-config.js` and replace `null` with the object:

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "build-ai-agents.firebaseapp.com",
  projectId: "build-ai-agents",
  storageBucket: "build-ai-agents.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

Then rebuild and publish:

```bash
python -I build.py
python -I build.py --site --doc-url https://github.com/ashishkaushalr-oss/build-ai-agents/blob/main/COURSE.md
git add -A
git commit -m "Connect account sync"
git push
```

## How it works, in one paragraph

Every page saves its state through one function in `shared/course.js`. The sync module in `shared/sync.js` wraps that function: each write gets a timestamp, and about a second after the last change the whole set of course keys is written to the document `users/<uid>` in Firestore. When a learner signs in on another device, the module compares the two copies key by key and keeps the newer value on each side, so nothing done on either device is lost. Signing out leaves the local copy in place; the hub's reset button clears it.

## What to check after connecting

- Open the site, click **Sign in with Google**, sign in. The header shows your first name and the hub's sync chip reads "saved to your Google account".
- Tick a day on one device, open the site on another device, sign in: the tick is there.
- In the Firebase console under Firestore you see one document per signed-in learner, named by user id, and nothing else.
