<b>
<pre align='center'>
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│ 88888888ba         888888888888                                 │
│ 88      "8b             88                                      │
│ 88      ,8P             88                                      │
│ 88aaaaaa8P'  ,adPPYba,  88  8b,dPPYba,  ,adPPYYba,  8b,dPPYba,  │
│ 88""""88'   a8P     88  88  88P'   "Y8  ""      Y8  88P'    "8a │
│ 88    `8b   8PP"""""""  88  88          ,adPPPPP88  88       d8 │
│ 88     `8b  "8b,   ,aa  88  88          88,    ,88  88b,   ,a8" │
│ 88      `8b  `"Ybbd8"   88  88          `"8bbdP"Y8  88`YbbdP"   │
│                                                     88          │
│                                                     88          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
<h5>
    <i><a href='https://en.wikipedia.org/wiki/Open-source_intelligence'>(OSINT)</a></i> Open-Source intelligence tracking and analysis tool. Inspired by <a href='https://github.com/jofpin/trape'>Trape</a>.
</h5>
</pre>
</b>

<br />
<p align='center'>
    <a href="https://standardjs.com">
        <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide">
    </a>
    <a href="https://standardjs.com">
        <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide">
    </a>
</p>
<br />

#### Setup 🧰
##### - With docker:
- Make sure [docker](https://www.docker.com/products/docker-desktop) and [docker-compose](https://docs.docker.com/compose/install/) is installed on your system.
- And run it with `docker-compose up` after the setup is complete, it should be running on http://0.0.0.0:8989

##### - With executable:
You can find an executable that supports your OS from the following links:

- [Github](https://github.com/mrf345/retrap/releases)
- [Sourceforge](https://sourceforge/retrap)

##### - From the source _(Tested only on Linux)_:
- Install dependencies `npm i .`
- Build assets and compile TypeScript `npm run build`
- Start the server `npm start`
- Package it into binaries `npm run pkg`


#### Features ✨
##### - Ngrok tunneling support
expose the local server to the internet with Ngrok secure tunnel

<details>
    <summary> - Demo: </summary>
</details>


##### - Captures and records user's information
bla bla

<details>
    <summary> - List of all captured information: </summary>
</details>

<details>
    <summary> - Demo: </summary>

</details>


##### - Detects user's active sessions 
bla bla

<details>
    <summary> - Demo: </summary>

</details>


##### - Realtime hooks to control user's active session
bla bla

<details>
    <summary> - Demo: </summary>

</details>


##### - Hooking script to integrate with your custom webpages
bla bla

<details>
    <summary> - Demo: </summary>
</details>


##### - RESTFul API to execute hooks, query users and integrate with other platforms
bla bla

<details>
    <summary> - Demo: </summary>
</details>


#### Disclaimer and Background ❎

##### - Why the hell ? 
bla bla

##### - How to protect yourself and the users of your web apps ?
bla bla



#### TODO ✅:
- [x] Add auto export guests to `guests.json` on root directory
- [x] Add REST API to send hook actions to Guests
- [x] Add ngrok support, to `settings` datastore and a `cli` option
- [ ] Add unit or integration tests
- [ ] Add proper and fully detailed README
- [ ] Fix up the docker containers setup
- [ ] Add token based authorization to the Admin REST API
- [ ] Add `Settings` model CRUD endpoints to Admin REST API
- [ ] Add an admin user-interface based on the REST API and/or Socket.io client. _(Preferably in React/Vue/Knockout)_
- [ ] Improve hook's `getScreenshot` and add it to the Sockets and REST API
- [ ] Maybe add a push notification hook 🤔 _(Needs research)_
