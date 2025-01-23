import { Hono } from 'hono'

const app = new Hono()

app.post('/register', async (c) => {
  const payload = await c.req.json()
  console.log(payload)

  return c.json({ success: true, payload })
})

app.post('/notifications', async (c) => {
  const payload = await c.req.json()
  console.log(payload)

  return c.json({ success: true, payload })
})

export default app
