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
└─────────────────────────────────────────────────────────────────┘
<h5>
    Open-Source intelligence (OSINT) tracking and analysis tool. Inspired by <a href='https://github.com/jofpin/trape'>Trape</a>.
</h5>
</pre>
</b>

#### Development Setup:

##### On Linux:
- Install dependencies `npm i .`
- Build assets and compile TypeScript `npm run build`
- Start the server `npm start`
- Package it into binaries `npm run pkg`

##### Cross-platform:
- Make sure [docker](https://www.docker.com/products/docker-desktop) and [docker-compose](https://docs.docker.com/compose/install/) is installed on your system.
- And run it with `docker-compose up` after the setup is complete, it should be running on http://127.0.0.1:8989


##### TODO:
- [x] Add auto export guests to `guests.json` on root directory
- [ ] Add REST API to send actions to Guests
- [x] Add ngrok support, to `settings` datastore and a `cli` option
- [ ] Add unit or integration tests
- [ ] Add proper and fully detailed documentation
- [ ] Add an admin user-interface for REST API
