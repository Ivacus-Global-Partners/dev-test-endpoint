import * as crypto from 'crypto'
import { escape, unescape } from 'querystring'

const key = 'y5zx25cIOUrtq3eWCinFscP1wmpTP35U'
// const UTF8 = 'utf-8'
const secret =
  'ownerCardNumber=2738142075966&ownerEmail=prueba6@prueba.com&ownerFullName=Prueba6&petBirthday=2017-08-07&petBreed=fbe26e8e-6720-4971-9710-d554251c4afa&petChipNumber=566295959565656&petGender=MALE&petName=petprueba6&petType=07c4dd89-54fd-46bc-929e-bb512bb578a2&petWeight=Entre 17 y 35Kg'

// '65cb6964-71da-43c0-10cfd-5326e0851771', '7a66a80e-d3e1-4691-148ec-7a6927005c2e'

const cipherText = encryptAESCBC256(secret, key)
// Crear la URL final
const host = 'https://api.petpass.pro' //'http://localhost:4001'
const url = `${host}/petpass/signIn/signInCarrefourProvider?clientId=${escape(cipherText)}`
console.log(url)

const eso = unescape(
  'gqmTp0NN%2FhhN%2FP5V8VBJIaN3FsRB65%2FginsU6s6z0PhSANvQjjeecNroHV61zDTMng0S0Lf7bulk6%2B13pTsoxqNvu8fdBO9E6tSF%2FIUwtu9e086y3tXdEkjS%2B0EM60%2F5evpXgAy8VsPEDLXQL0HunQFHB1JJfMY2AAkywGrBy9CxlAlFPF9WISzaaCwf0J86LVi3Cl3SxF%2B8dwJZ2DFDcAvdqRr3WnmwgJKIxLiH6u9sfHfnopD9A4rPvn3Mm%2FvKSsea69jkRC%2B9H8PomPzTIsnCstZGMhPB9MkFsPpYt7eBCkaCYEWXjFAZiQkX5PJY5RgfgeyAB0D3fvv5FjAWulXQfFxxJH3XJGCzXSPoLsmGEJsP%2F7T%2FN2vT0n8RUlmu'
)
// 'gqmTp0NN/hhN/P5V8VBJIaN3FsRB65/ginsU6s6z0PiEh7yfcVwiAuVGEQlnzL52BR9jIXif3fyo1ha0w9fqHb4bRbDIbLig2FfJq2uYJzeSdIfkynvDB+B7nq6LLuHt842Ea3wa4ei1YNKcJVwTqf/KNxTSS6f1kcV2YbmWhDymR/tq39ML8RdjiDbuPEG2YoFGeE5JSZ5GeBpeVfnlvNiIVmohwvAKDC5YQUhBLNDlqwGAAZBFLRPlvz1WSpq84Ox1eMwnMLXDJq77O8oymmtey7o6jRaUVwp7sZ8lmw4mncI07u9NCue0EARqHGY+D5GmAdGbqPs0T1jCI79uTo7JoC7VTrVMy5ET4s7PAK+nd9phC9Di4WJjiE3SahPG'
const descifrado = decryptAESCBC256(eso, key)

console.log('\n')

console.log(descifrado)

function encryptAESCBC256(textToChiper: string, key: string): string {
  // Verificar que la clave tenga 32 bytes (256 bits)
  if (Buffer.from(key).length !== 32) {
    throw new Error('La clave debe tener 32 bytes de longitud')
  }

  try {
    // Convertir la clave a Uint8Array
    const keyBuffer = new Uint8Array(Buffer.from(key))

    // Crear el IV usando los primeros 16 bytes de la clave
    const iv = new Uint8Array(16)
    iv.set(keyBuffer.slice(0, 16))

    // Crear el objeto de cifrado
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv)

    let encrypted = cipher.update(textToChiper, 'utf-8', 'base64')
    encrypted += cipher.final('base64')

    // Codificar el texto a cifrar en base64 y convertir a Uint8Array
    // const cipherText = new Uint8Array(Buffer.from(textToChiper, 'base64'))
    // const cipherText = escape(encrypted)

    return encrypted

    // Cifrar y convertir a Uint8Array
    // const decryptedPart1 = new Uint8Array(cipher.update(encryptedArray))
    // const decryptedPart2 = new Uint8Array(cipher.final())

    // Combinar las dos partes en un nuevo Uint8Array
    // const encrypted = new Uint8Array(decryptedPart1.length + decryptedPart2.length)
    // encrypted.set(decryptedPart1, 0)
    // encrypted.set(decryptedPart2, decryptedPart1.length)

    // Convertir el resultado final a string
    // return Buffer.from(encrypted).toString('utf8')
  } catch (error) {
    throw new Error(`Error al encriptar: ${error instanceof Error ? error.message : 'Desconocido'}`)
  }
}

function decryptAESCBC256(cipherText: string, key: string): string {
  // Verificar que la clave tenga 32 bytes (256 bits)
  if (Buffer.from(key).length !== 32) {
    throw new Error('La clave debe tener 32 bytes de longitud')
  }

  try {
    // Convertir la clave a Uint8Array
    const keyBuffer = new Uint8Array(Buffer.from(key))

    // Crear el IV usando los primeros 16 bytes de la clave
    const iv = new Uint8Array(16)
    iv.set(keyBuffer.slice(0, 16))

    // Crear el objeto de descifrado
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv)

    // Decodificar el texto cifrado de base64 y convertir a Uint8Array
    const encryptedArray = new Uint8Array(Buffer.from(cipherText, 'base64'))

    // Descifrar y convertir a Uint8Array
    const decryptedPart1 = new Uint8Array(decipher.update(encryptedArray))
    const decryptedPart2 = new Uint8Array(decipher.final())

    // Combinar las dos partes en un nuevo Uint8Array
    const decrypted = new Uint8Array(decryptedPart1.length + decryptedPart2.length)
    decrypted.set(decryptedPart1, 0)
    decrypted.set(decryptedPart2, decryptedPart1.length)

    // Convertir el resultado final a string
    return Buffer.from(decrypted).toString('utf8')
  } catch (error) {
    throw new Error(`Error al desencriptar: ${error instanceof Error ? error.message : 'Desconocido'}`)
  }
}
