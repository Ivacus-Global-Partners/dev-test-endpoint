import { Hono } from 'hono'
import { logger } from 'hono/logger'

import bot from './rutas/x/bot'
import purchase from './rutas/x/shop/purchase'
import redsys from './rutas/x/payment/redsys'

const app = new Hono()
app.use(logger())

app.get('/', (c) => {
  return c.text('Hello!!')
})

app.route('/x/bot', bot)
app.route('/x/shop', purchase)
app.route('/x/payment', redsys)

export default app
