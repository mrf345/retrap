import { note, command } from './styles'
import { Guest } from '../src/datastore'
import { getIdString } from '../src/utils'

const logs = []

export default function log(guest:Guest, message:string, data?:any) {
    const title = `${guest.ip}:${guest.os}:${guest.browser}`
    const text = `${note(title)} > ${message}\n`
    const identifier = `${text}${getIdString(data)}`

    if (global.logging && !logs.includes(identifier)) {
        console.log(command(new Date()), '\n')
        console.log(text)
        if (data) console.log(data, '\n')
        logs.push(identifier)
    }
}
