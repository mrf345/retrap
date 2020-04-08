import * as FS from 'fs'
import * as Path from 'path'
import { Model, Timestamps, Encryption } from 'nedb-models'

import { BASE_DIR, PASSWORD } from './constants'


export const storagePath = Path.join(BASE_DIR, 'collections')
if (!FS.existsSync(storagePath)) FS.mkdirSync(storagePath, {recursive: true})
const encryption = () => ({password: PASSWORD, algorithm: 'aes256'})


interface Post {
    path:string
    date:Date
    data:any
}


export class Guest extends Model {
    ip:string
    os:string
    browser:string
    browserEngine:string
    cpuArch:string
    posts:Post[]
    logs:any[]

    async add(ip:string, os:string, browser:string, browserEngine:string, cpuArch:string, posts = [], logs = []):Promise<Guest> {
        this.ip = ip
        this.os = os
        this.browser = browser
        this.browserEngine = browserEngine
        this.cpuArch = cpuArch
        this.posts = posts
        this.logs = logs

        return await this.save()
    }

    static encryption = encryption
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

    static encryption = encryption
    static datastore() {
        return {filename: Path.join(storagePath, 'settings.db')}
    }
}


Guest.use(Encryption)
Guest.use(Timestamps)
Setting.use(Encryption)
