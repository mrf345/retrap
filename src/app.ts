import * as Path from 'path'
import * as FS from 'fs'
import * as Express from 'express'
import * as Http from 'http'
import * as Socket from 'socket.io'
import * as cors from 'cors'
import * as Morgan from 'morgan'
import * as proxy from 'html2canvas-proxy'

import { BASE_DIR } from './constants'
import { Setting } from './datastore'
import ParallelBrowser from './parallelBrowser'
import GuestRoutes from './routes/guest'
import Sockets from './sockets'


export const app = Express()
export const server = Http.createServer(app)
export const io = Socket(server)
export const setupAppAndIO = async (address:string) => {
    const { defaultLink, retries, timeout } = await Setting.findOne({}) || await new Setting().add()
    const cacheDir = Path.join(BASE_DIR, 'cache')
    if (!FS.existsSync(cacheDir)) FS.mkdirSync(cacheDir, {recursive: true})
    const browser = new ParallelBrowser(address, cacheDir, defaultLink, retries, timeout)

    app.use(cors({origin: true}))
    app.use(Express.urlencoded())
    app.use('/fe', Express.static(Path.resolve(__dirname, '../frontend'), {index: false}))
    app.use(Express.static(cacheDir, {index: false}))
    app.use((req, res, next) => {
        res.locals.browser = browser
        return next()
    })
    app.use('/proxy', proxy())
    app.use('/', GuestRoutes)
    io.on('connection', Sockets)
}
