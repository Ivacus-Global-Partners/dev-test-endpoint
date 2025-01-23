export function createGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : r + 0x8
    return v.toString(16)
  })
}

import CryptoJS from 'crypto-es' //replace thie with script tag in browser env

export const encodeBase64 = (text: string) => {
  const wordArray = CryptoJS.enc.Utf8.parse(text)
  const base64 = CryptoJS.enc.Base64.stringify(wordArray)
  return base64
}

export const decodeBase64 = (base64encodedtext: string) => {
  const parsedWordArray = CryptoJS.enc.Base64.parse(base64encodedtext)
  const parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8)
  return parsedStr
}
