import * as Path from 'path'
import * as Express from 'express'
import * as Http from 'http'
import * as Socket from 'socket.io'
import * as cors from 'cors'
import * as proxy from 'html2canvas-proxy'

import GuestRoutes from './routes/guest'
import Sockets from './sockets'


export const app = Express()
export const server = Http.createServer(app)
export const io = Socket(server)
export const setupAppAndIO = async (browser:any, cacheDir:string) => {
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
