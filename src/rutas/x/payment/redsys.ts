import { Hono } from 'hono'
import { payloadSchema } from './zschema'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

const valida = zValidator('json', payloadSchema, (result, c) => {
  if (!result.success) {
    return c.json({ code: 0, error: 'Ok', url: null })
  }
})

app.post('/geturl', async (c) => {
  const payload = await c.req.json()
  console.log(payload)

  return c.json({ code: 1, error: null, url: 'http://dev.api.petpass.pro/x/payment-ok' })
})

app.post('/whaturl', async (c) => {
  const payload = await c.req.json()
  console.log(payload)

  return c.json({ code: 1 })
})

app.post('/payment-ok', async (c) => {
  const payload = await c.req.json()
  console.log(payload)

  return c.json({ code: 1, error: 0, url: 'https://eso', payment: true })
})

export default app
