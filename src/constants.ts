import * as Path from 'path'


export const BASE_DIR = process.execPath.endsWith('node') ? __dirname : Path.dirname(process.execPath)
export const PASSWORD = process.env.DBPASSWORD || 'development'
