import { Hono } from 'hono'
import register from './rutas/x/bot/register'
import purchase from './rutas/x/shop/purchase'
import redsys from './rutas/x/payment/redsys'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello!!')
})

app.route('/x/bot', register)
app.route('/x/shop', purchase)
app.route('/x/payment', redsys)

export default app
