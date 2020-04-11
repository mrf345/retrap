import * as meow from 'meow'
import * as isPortReachable from 'is-port-reachable'
import isElevated = require('is-elevated')

import * as pkg from '../package.json'
import { parseWelcomeMessage } from './welcome'
import { server, setupAppAndIO } from '../src/app'
import { bold, command, param, note } from './styles'


const cli = meow(`
    ${bold('Usage')}

        ${command('$')} ${process.execPath} [option]

    ${bold('Options')}

        ${param('--ip-address, -i')} IP address to stream server on        ${note('(127.0.0.1)')}
        ${param('--port, -p')} Port to stream server through               ${note('(8989)')}
        ${param('--logging, -o')} Display http requests logs               ${note('(true)')}

    ${bold('Example')}

        ${command('$')} ${pkg.name} ${command('--port')} 8080 ${command('-l')} http://github.com
`, {flags: {
        ipAddress: {type: 'string', alias: 'i', default: '127.0.0.1'},
        port: {type: 'number', alias: 'p', default: 8989},
        logging: {type: 'boolean', alias: 'o', default: true}
    }
})


;(async () => {
    const { ipAddress, port, defaultLink, logging } = cli.flags
    const admin = await isElevated()

    if (1024 > port && !admin) return console.warn(
        note('Error: ') +
        'the selected port requires a admin access to stream through it. grant it permissions, or choose a larger port.\n')

    try {
        await isPortReachable(port, {host: ipAddress})
        await setupAppAndIO(`http://${ipAddress}:${port}`, logging)
        server.listen(port, ipAddress, () => console.log(parseWelcomeMessage(ipAddress, port, pkg.version, logging)))
    } catch (err) {
        console.warn(note('Error: ') + 'failed to connect through the chosen port number or IP address, probably busy.\n')
        console.log(err, '\n')
    }

})();
