import { Hono } from 'hono'
import notifications from './notifications'
import register from './register'
import datablock from './datablock'

const app = new Hono()

app.route('/register', register)
app.route('/datablock', datablock)
app.route('/notifications', notifications)

export default app
