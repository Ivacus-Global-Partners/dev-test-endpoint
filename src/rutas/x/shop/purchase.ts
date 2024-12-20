import { Context, Hono } from 'hono'
import { payloadSchema } from './zschemas'
import { Payload } from './types'
import { zValidator } from '@hono/zod-validator'
// import { getData } from './lib/data'
import { createPurchase } from '@lib/process'

const app = new Hono()

const manualPurchase = async (c: Context<object, '/purchase', { out: { json: Payload } }>) => {
  console.log(c)
  const data = c.req.valid('json')
  const purchasing = await createPurchase(data)
  return c.json({ ...purchasing })
}

const valida = zValidator('json', payloadSchema, (result, c) => {
  if (!result.success) {
    return c.text('Json invalido!', 400)
  }
})

app.post('/purchase', valida, manualPurchase)

export default app
