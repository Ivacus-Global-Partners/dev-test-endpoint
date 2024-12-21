import { Hono } from 'hono'
import { payloadSchema } from './zschemas'
import { zValidator } from '@hono/zod-validator'
// import { getData } from './lib/data'
import { createPurchase } from './process'

const app = new Hono()

const valida = zValidator('json', payloadSchema, (result, c) => {
  if (!result.success) {
    return c.text('Json invalido!', 400)
  }
})

app.post('/purchase', valida, async (c) => {
  const data = c.req.valid('json')
  const purchasing = await createPurchase(data)
  return c.json({ ...purchasing })
})

export default app
