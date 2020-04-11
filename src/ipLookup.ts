import fetch from 'node-fetch'

import { note } from '../bin/styles'


interface IpInfo {
    country:string
    countryCode:string
    regionName:string
    city:string
    zip:string
    lat:number
    lon:number
    timezone:string
    isp:string
}


interface IpLookupAPIResponse extends IpInfo {
    query:string
    status:string
    region:string
    org:string
    as:string
}


export default async function ipLookup (ip:string):Promise<IpInfo> {
    let baseUrl = 'http://ip-api.com/json/'
    let publicIp = ip
    let ipInfo:IpLookupAPIResponse

    try {
        if (/localhost|127.0.0.1/.test(publicIp)) publicIp = await fetch('https://api.ipify.org/').then(r => r.text())
        ipInfo = await fetch(baseUrl += publicIp).then(r => r.json())
        if (ipInfo.status !== 'success') throw Error(`API failed to lookup ${baseUrl}`)
    } catch (err) {
        console.warn('\n' + note('Warning: ') + `Failed to lookup the IP address ${publicIp}\n`)
        console.log(err, '\n')
    }

    return {
        country: ipInfo.country,
        countryCode: ipInfo.countryCode,
        regionName: ipInfo.regionName,
        city: ipInfo.city,
        zip: ipInfo.zip,
        lat: ipInfo.lat,
        lon: ipInfo.lon,
        timezone: ipInfo.timezone,
        isp: ipInfo.isp
    }
}
