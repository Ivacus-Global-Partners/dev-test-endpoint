import { Hono } from 'hono'
import register from './rutas/x/shop/register'
import purchase from './rutas/x/shop/register'
import redsys from './rutas/x/payment/redsys'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello!!')
})

app.route('/x/shop', register)
app.route('/x/shop', purchase)
app.route('/x/payment', redsys)

export default app
