const request = require('supertest')
const status = require('http-status-codes')

const app = require('../build/src/app')
const parallelBrowser = require('../build/src/parallelBrowser').default


jest.setTimeout(50000)
describe('Testing main functionalities through API on happy-day scenarios 👯‍♀️', () => {
    const browser = new parallelBrowser()
    const ip = '::ffff:127.0.0.1'
    const guestKeys = new Set([
        'browser', 'browserEngine', 'city', 'country', 'countryCode', 'cpuArch', 'ip',
        'isp', 'keyLogs', 'lat', 'logs', 'lon', 'online', 'os', 'posts', 'regionName',
        'screenshots', 'timezone', 'zip', '_id', 'createdAt', 'updatedAt'
    ])

    beforeAll(async () => {
        app.setupAppAndIO(browser)
        await request(app.app).get('/http://example.com')
    })

    it('List captured guests', async () => {
        expect.assertions(2)

        const response = await request(app.app).get('/api/guests')

        expect(response.status).toEqual(status.OK)
        response.body.forEach(guest =>
            expect(Object.keys(guest).sort())
                .toEqual(Array.from(guestKeys).sort())
        )
    })

    it('Get a captured guest', async () => {
        expect.assertions(2)

        const response = await request(app.app).get(`/api/guests/${ip}`)

        expect(response.status).toEqual(status.OK)
        expect(Object.keys(response.body).sort())
            .toEqual(Array.from(guestKeys).sort())
    })

    it('Send alert hook action to a guest', async () => {
        expect.assertions(1)

        const message = 'Testing Message'
        const response = await request(app.app)
            .get(`/api/guests/${ip}/alert/${message}`)

        expect(response.status).toEqual(status.OK)
    })

    it('Send redirect hook action to a guest', async () => {
        expect.assertions(1)

        const url = 'testing.com'
        const response = await request(app.app)
            .get(`/api/guests/${ip}/redirect/${url}`)

        expect(response.status).toEqual(status.OK)
    })

    it('Send say hook action to a guest', async () => {
        expect.assertions(1)

        const message = 'Testing Message'
        const response = await request(app.app)
            .get(`/api/guests/${ip}/say/${message}`)

        expect(response.status).toEqual(status.OK)
    })

    it('Send inject script hook action to a guest', async () => {
        expect.assertions(1)

        const script = `
            const [a, b] = [100, 900]
            console.assert(a !== b)
        `
        const response = await request(app.app)
            .post(`/api/guests/${ip}/inject`)
            .send({ script })

        expect(response.status).toEqual(status.OK)
    })
})
