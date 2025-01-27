import { Hono } from 'hono'
import redsys from './redsys'

const app = new Hono()

app.route('/geturl', redsys)

export default app
