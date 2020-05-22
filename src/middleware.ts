import ipLookup from './ipLookup'
import { Guest } from './datastore'
import { httpify } from './utils'
import log from '../bin/logger'
import { UAParser } from 'ua-parser-js'


export const storeAndLookUpGuests = async (req:any, res:any, next:() => void) => {
    if (!/^\/proxy|\/api|\/api-docs/.test(req.url)) {
        const link = httpify(decodeURIComponent(req.url.slice(1)))
        const ip = req.header('x-forwarded-for') || req.connection.remoteAddress
        const userAgent = new UAParser(req.header('user-agent'))
        let guest:Guest = await Guest.findOne({ ip })
        const isNewGuest = !guest

        if (!guest) guest = await new Guest().add(
            ip,
            `${userAgent.getOS().name} ${userAgent.getOS().version}`,
            `${userAgent.getBrowser().name} ${userAgent.getBrowser().version}`)

        guest.logs.push(`${req.method} - ${link} - ${new Date()}`)

        if (guest && !guest.country) {
            const ipData = await ipLookup(ip) || {}

            Object
                .entries(ipData)
                .forEach(([key, value]) => guest[key] = value)

            if (Object.keys(ipData).length) log(guest, `guest's IP details was captured:`, ipData)
        }

        if (isNewGuest) await guest.store()
    }

    return next()
}
