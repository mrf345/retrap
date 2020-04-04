import * as FS from 'fs'
import * as Path from 'path'
import { Model, Timestamps, Encryption } from 'nedb-models'

import { BASE_DIR, PASSWORD } from './constants'


export const storagePath = Path.join(BASE_DIR, 'collections')
if (!FS.existsSync(storagePath)) FS.mkdirSync(storagePath, {recursive: true})
const encryption = () => ({password: PASSWORD, algorithm: 'aes256'})


export class Guest extends Model {
    ips:string[] = []
    os = ''
    browser = ''
    browserEngine = ''
    cpuArch = ''

    static encryption = encryption
    static datastore() {
        return {filename: Path.join(storagePath, 'guests.db')}
    }
}


export class Setting extends Model {
    timeout = 30
    retries = 2
    ngrokApiKey = ''

    static encryption = encryption
    static datastore() {
        return {filename: Path.join(storagePath, 'settings.db')}
    }
}


Guest.use(Encryption)
Guest.use(Timestamps)
Setting.use(Encryption)
