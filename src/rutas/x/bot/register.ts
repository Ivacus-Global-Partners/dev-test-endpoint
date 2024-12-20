// import { Context, Hono } from 'hono'
import { Hono } from 'hono'
// import { payloadSchema } from './zschemas'
// import { Payload } from './types'
// import { zValidator } from '@hono/zod-validator'
// import { getData } from './lib/data'
// import { createPurchase } from '@lib/process'

const app = new Hono()

// const registerPurchase = async (c: Context<object, '/register', { out: { json: Payload } }>) => {
//   // const data = c.req.valid('json')
//   // const purchasing = await createPurchase(data)
//   const purchasing = c.req.parseBody
//   return c.json({ ...purchasing })
// }

// const valida = zValidator('json', payloadSchema, (result, c) => {
//   if (!result.success) {
//     return c.text('Json invalido!', 400)
//   }
// })

app.post('/register', async (c) => {
  const payload = await c.req.json()
  console.log(payload)

  return c.json({ success: true, payload })
})

export default app
