import * as Path from 'path'
import * as FS from 'fs'
import * as Express from 'express'
import * as cors from 'cors'
import * as Morgan from 'morgan'
import * as proxy from 'html2canvas-proxy'
import { UAParser } from 'ua-parser-js'

import { BASE_DIR, PASSWORD } from './constants'
import { Guest, Setting } from './datastore'
import FakeBrowser from './fakeBrowser'
import { isValidUrl, httpify, resolveRelativeUrl } from './utils'


export const app = Express()
export const setupApp = async (address:string, logging:boolean) => {
    const { defaultLink, retries, timeout } = await Setting.findOne({}) || await new Setting().add()
    const cacheDir = Path.join(BASE_DIR, 'cache')
    if (!FS.existsSync(cacheDir)) FS.mkdirSync(cacheDir, {recursive: true})
    const browser = new FakeBrowser(address, cacheDir, defaultLink, retries, timeout)

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
        const navigator = new UAParser(req.header('user-agent'))
        const ip = req.header('x-forwarded-for') || req.connection.remoteAddress
        let guest:Guest = await Guest.findOne({ ip })

        if (!guest) {
            guest = await new Guest().add(
                ip,
                `${navigator.getOS().name} ${navigator.getOS().version}`,
                `${navigator.getBrowser().name} ${navigator.getBrowser().version}`,
                `${navigator.getEngine().name} ${navigator.getEngine().version}`,
                navigator.getCPU().architecture
            )
        }

        if (!isValidUrl(link)) link = setting.defaultLink
        else {
            guest.logs.push(`${req.method} - ${link} - ${new Date()}`)
            guest.save()
        }

        if (req.method.toLowerCase() === 'post') {
            const cleanBody = Object
                .entries(req.body)
                .filter(([key, value]) => !!value)

            guest.posts.push({path: link, date: new Date(), data: cleanBody})
            await guest.save()
        }

        resp.status(200)
            .sendFile(Path.join(cacheDir, await browser.get(link, req.headers, ip)))
    })
}
