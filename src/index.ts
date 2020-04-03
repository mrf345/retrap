import * as Express from 'express'
import * as Path from 'path'
import * as FS from 'fs'
import * as Morgan from 'morgan'

import FakeBrowser from './fakeBrowser'
import { isValidUrl, httpify } from './utils'


export const app = Express()
export const setupApp = (address:string, defaultLink:string, logging:boolean) => {
    const envPath = process.execPath.endsWith('node') ? __dirname : Path.dirname(process.execPath)
    const cacheDir = Path.resolve(envPath, 'cache')
    const browser = new FakeBrowser(address, cacheDir, defaultLink)

    if (!FS.existsSync(cacheDir)) FS.mkdirSync(cacheDir, {recursive: true})

    app.use(Express.static(Path.resolve(__dirname, '../frontend'), {index: false}))
    app.use(Express.static(cacheDir, {index: false}))
    if (logging) app.use(Morgan('combined'))


    app.get('/admin', async (req, resp) => {
        resp.status(200)
            .sendFile(Path.resolve(__dirname, '../frontend/index.html'))
    })


    app.get('*', async (req, resp) => {
        let link = httpify(decodeURIComponent(req.url.slice(1)))
        if (!isValidUrl(link)) link = defaultLink

        resp.status(200)
            .sendFile(Path.join(cacheDir, (await browser.get(link, req.headers))))
    })
}
