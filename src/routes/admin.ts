import { Router } from 'express'
import * as Path from 'path'


const router = Router()

router.get('/', async (req, resp) => {
    resp.status(200)
        .sendFile(Path.resolve(__dirname, '../frontend/index.html'))
})


export default router
