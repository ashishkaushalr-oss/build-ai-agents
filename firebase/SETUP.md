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

## 4. Tell Firebase about the website and get its "config"

Why this step exists: Firebase has to know that a website (this course) will be talking to it. When you register the website, Firebase hands back a small block of text called the **config**. It is the project's address: six values that tell the course which Firebase project to connect to. Nothing in it is secret.

1. In the Firebase console, click the **gear icon** next to **Project Overview** at the top left, then **Project settings**.
2. You land on the **General** tab. Scroll down to the section **Your apps**. If it says there are no apps yet, click the round button with **`</>`** on it (that is the "web app" button). If an app is already listed there, click it and jump to point 4.
3. Type a nickname, for example `course site`. Leave **Also set up Firebase Hosting** unticked. Click **Register app**.
4. Firebase now shows a block of code. Just above it are two little options, **npm** and **Config**: click **Config**. The block starts with `const firebaseConfig = {` and ends with `};`. Select all of it, copy it, then click **Continue to console**.

The copied block looks like this (your values will differ):

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "build-ai-agents.firebaseapp.com",
  projectId: "build-ai-agents",
  storageBucket: "build-ai-agents.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

You can find it again any time: **Project settings**, **General**, **Your apps**, click the app, **SDK setup and configuration**, **Config**.

The `apiKey` is not a password. It only says which project the site talks to; what anyone can do with the data is decided by the rules you published in step 3.

## 5. Put the config into the course

The course reads exactly one line of the file `shared/firebase-config.js`:

```js
window.FIREBASE_CONFIG = null;
```

Replace the word `null` with the part of the copied block from `{` to `}`. Do **not** paste the words `const firebaseConfig =` in front: that would create a separate variable the course never looks at, and sign-in would stay off. The line must end up as:

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "build-ai-agents.firebaseapp.com",
  projectId: "build-ai-agents",
  storageBucket: "build-ai-agents.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

The easiest route is to paste the copied block into a chat with Claude and ask it to connect the course; it edits this file, rebuilds and commits. In this repository that is already done: the config points at the project `build-ai-agents-1ffed`.

Doing it by hand instead, the pages have to be rebuilt afterwards, because the build copies this file into every page. From the course folder, in a terminal:

```bash
python -I build.py
python -I build.py --site --doc-url https://github.com/ashishkaushalr-oss/build-ai-agents/blob/main/COURSE.md
git add -A
git commit -m "Connect account sync"
git push
git push intuit main:master
```

The first command rebuilds the course pages for Claude in `dist/`, the second rebuilds the website in `docs/` (the folder GitHub Pages serves), `git add` and `git commit` record the change, and the two pushes upload it to the public and the Intuit repository.

## How it works, in one paragraph

Every page saves its state through one function in `shared/course.js`. The sync module in `shared/sync.js` wraps that function: each write gets a timestamp, and about a second after the last change the whole set of course keys is written to the document `users/<uid>` in Firestore. When a learner signs in on another device, the module compares the two copies key by key and keeps the newer value on each side, so nothing done on either device is lost. Signing out leaves the local copy in place; the hub's reset button clears it.

## What to check after connecting

- Open the site, click **Sign in with Google**, sign in. The header shows your first name and the hub's sync chip reads "saved to your Google account".
- Tick a day on one device, open the site on another device, sign in: the tick is there.
- In the Firebase console under Firestore you see one document per signed-in learner, named by user id, and nothing else.
