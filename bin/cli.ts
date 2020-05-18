import * as Path from 'path'
import * as FS from 'fs'
import * as meow from 'meow'
import * as isPortReachable from 'is-port-reachable'
import isElevated = require('is-elevated')
import ngrok = require('ngrok')

import * as pkg from '../package.json'
import { parseWelcomeMessage } from './welcome'
import { server, setupAppAndIO } from '../src/app'
import { bold, command, param, note } from './styles'
import { Setting } from '../src/datastore'
import { BASE_DIR } from '../src/constants'
import ParallelBrowser from '../src/parallelBrowser'


const cli = meow(`
    ${bold('Usage')}

        ${command('$')} ${process.execPath} [option]

    ${bold('Options')}

        ${param('--ip-address, -i')} IP address to stream server on        ${note('(0.0.0.0)')}
        ${param('--port, -p')} Port to stream server through               ${note('(8989)')}
        ${param('--logging, -o')} Display http requests logs               ${note('(true)')}
        ${param('--ngrok-auth-token', '-a')} Ngrok account authentication token

    ${bold('Example')}

        ${command('$')} ${pkg.name} ${command('--port')} 8080 ${command('-l')}
`, {flags: {
        ipAddress: {type: 'string', alias: 'i', default: '0.0.0.0'},
        port: {type: 'number', alias: 'p', default: 8989},
        logging: {type: 'boolean', alias: 'o', default: true},
        authtoken: {type: 'string', alias: 'a', default: ''}
    }
})
const beforeExit = async () => {
    await ngrok.kill()
    process.exit()
}


process.on('exit', beforeExit)
process.on('SIGINT', beforeExit)
;(async () => {
    const { ipAddress, port, logging, authtoken } = cli.flags
    const admin = await isElevated()

    if (1024 > port && !admin) return console.warn(
        note('Error: ') +
        'the selected port requires a admin access to stream through it. grant it permissions, or choose a larger port.\n')

    try {
        const { defaultLink, retries, timeout, ngrokAuthToken } = await Setting.findOne({}) || await new Setting().add()
        const cacheDir = Path.join(BASE_DIR, 'cache')
        if (!FS.existsSync(cacheDir)) FS.mkdirSync(cacheDir, {recursive: true})
        const browser = new ParallelBrowser(`http://${ipAddress}:${port}`, cacheDir, defaultLink, retries, timeout)

        await isPortReachable(port, {host: ipAddress})
        await setupAppAndIO(browser, cacheDir)
        server.listen(port, ipAddress, async () => {
            const storedOrPassedToken = authtoken || ngrokAuthToken
            let tunnelAddress = ''

            if (storedOrPassedToken) await ngrok.authtoken(storedOrPassedToken)
            if (storedOrPassedToken) {
                try { tunnelAddress = await ngrok.connect({addr: port, authtoken: storedOrPassedToken}) }
                catch (err) { tunnelAddress = await ngrok.connect({addr: port, authtoken: storedOrPassedToken}) }

                tunnelAddress = tunnelAddress.replace('https', 'http')
                browser.serverUrl = tunnelAddress
            }

            console.log(parseWelcomeMessage(ipAddress, port, pkg.version, logging, tunnelAddress))
            global.logging = logging
        })
    } catch (err) {
        console.warn(note('Error: ') + 'failed to connect through the chosen port number or IP address, could be the Ngrok token.\n')
        console.log(err, '\n')
    }
})();
