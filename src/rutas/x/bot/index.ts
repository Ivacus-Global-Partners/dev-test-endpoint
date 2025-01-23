import { Hono } from 'hono'
import notifications from './notifications'
import register from './register'

const app = new Hono()

app.route('/register', register)
app.route('/notifications', notifications)

export default app
