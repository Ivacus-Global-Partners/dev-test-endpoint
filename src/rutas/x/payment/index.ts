import { Hono } from 'hono'
import redsys from './redsys'

const app = new Hono()

app.route('/', redsys)

export default app
