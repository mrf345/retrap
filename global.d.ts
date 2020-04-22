declare module 'is-port-reachable'
declare module 'html2canvas-proxy'
declare module '@babel/polyfill'

declare module 'nedb-models' {
    class Model {
        static find<T>(query: any, projection?: {[p in keyof T]?:number}): Nedb.Cursor<(T & Document)[]>
        static findOne<T>(query: any, projection?: {[p in keyof T]?:number}): Promise<T & Document>
        static insert<T extends any | any[]>(docs: T): Promise<T & Document>
        update<T>(
          query: any,
          updateQuery: any,
          options?: Nedb.UpdateOptions & { returnUpdatedDocs?: false }
        ): Promise<number>
        update<T>(
          query: any,
          updateQuery: any,
          options?: Nedb.UpdateOptions & { returnUpdatedDocs: true; multi?: false }
        ): Promise<T & Document>
        update<T>(
          query: any,
          updateQuery: any,
          options?: Nedb.UpdateOptions & { returnUpdatedDocs: true; multi: true }
        ): Promise<(T & Document)[]>
        remove(query: any, options: Nedb.RemoveOptions): Promise<number>
        static count(query: any): Promise<number>
        ensureIndex(options: Nedb.EnsureIndexOptions): Promise<undefined>
        removeIndex(fieldName: string): Promise<undefined>
        static use: (middleWare:any) => void
        save: <T>() => Promise<T>
    }

    namespace Nedb {
        interface Cursor<T> extends Promise<T> {
          sort(query: any): Cursor<T>
          skip(n: number): Cursor<T>
          limit(n: number): Cursor<T>
          projection(projection: {[p in keyof T]?:number}): Cursor<T>
          exec(): Promise<T[]>
        }

        interface DatastoreOptions {
          filename?: string
          inMemoryOnly?: boolean
          nodeWebkitAppName?: boolean
          autoload?: boolean
          onload?(error: Error): any
          afterSerialization?(line: string): string
          beforeDeserialization?(line: string): string
          corruptAlertThreshold?: number
          timestampData?: boolean
        }

        interface UpdateOptions {
          multi?: boolean
          upsert?: boolean
          returnUpdatedDocs?: boolean
        }

        interface RemoveOptions {
          multi?: boolean
        }
      
        interface EnsureIndexOptions {
          fieldName: string
          unique?: boolean
          sparse?: boolean
        }

        interface Persistence {
          compactDatafile(): void
          setAutocompactionInterval(interval: number): void
          stopAutocompaction(): void
        }
      }

    const Encryption:any
    const Timestamps:any
}


interface ObjectConstructor {
  fromEntries(xs: any): object
}


interface Window {
  ORIGINAL:string
}

declare module NodeJS {
  interface Global {
    logging:boolean
  }
  interface Process {
    pkg:boolean
  }
}

interface Navigator {
  getBattery?:() => Promise<any>
  usb:any
}


type Setting = {
    defaultLink:string
    timeout:number
    retries:number
    apiKeys: {
        negrok:string
    }
}


type GeneralInfo = {
  userAgent:string
  charging:boolean
  chargeLeft:string
  doNotTrack:string
  java:boolean
  flash:boolean
  language:string
  languages:readonly string[]
  touch:boolean
  usbDevices:string[]
  resolution:string
  cpuCors:number
}


type Sessions = {
  facebook:boolean
  youtube:boolean
  gmail:boolean
  spotify:boolean
  github:boolean
  instagram:boolean
  snapchat:boolean
  airbnb:boolean
}


type Post = {
  path:string
  date:Date
  data:any
}


type KeyLog = {
  url:string
  date:Date
  log:string
}


type NetworkMeasures = {
  kbps:string
  mbps:string
}


type NetworkSpeedObj = {
  down:NetworkMeasures
  up:NetworkMeasures
}
