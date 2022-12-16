import { aes, v1, v2 } from '../src/safe'
import * as rsa from '../src/safe/rsa'
import * as chacha from '../src/safe/chacha'

import { ALICE, BIG_JSON, RAWKEY } from './env.test'

describe('Safe testing', () => {
  describe('V1 Testing', () => {
    it('V1::encrypt', function () {
      const encrypted = v1.encrypt(
        RAWKEY,
        ALICE.password,
        ALICE.salt
      )
      expect(encrypted).toEqual(ALICE.key)
    })
    it('V1::decrypt', function () {
      const decrypted = v1.decrypt(
        ALICE.key,
        ALICE.password,
        ALICE.salt
      )
      expect(decrypted).toEqual(RAWKEY)
    })
  })

  describe('V2 Testing', () => {
    it('AES testing', async function () {
      const plain = 'Hello World'
      const encoded = aes.encrypt(plain, ALICE.password, ALICE.salt)
      expect(aes.decrypt(encoded, ALICE.password, ALICE.salt)).toEqual(plain)
    })
    it('RSA testing', async function () {
      const key = await rsa.genKeyPair()
      expect(key).toBeTruthy()

      const plain = 'Hello World'
      const encoded = rsa.encrypt(key.publicKey, Buffer.from(plain, 'utf8'))
      expect(rsa.decrypt(key.privateKey, encoded).toString('utf8')).toEqual(plain)
    })
    it('Chacha testing', () => {
      const chachaKey = chacha.genPassword()
      const plainText = 'Hello world'

      const encrypted = chacha.encrypt(chachaKey, Buffer.from(plainText, 'utf8'))
      const decrypted = chacha.decrypt(chachaKey, encrypted)
      expect(decrypted.toString('utf8')).toEqual(plainText)
    })
    it('Enc/Dec testing', async function () {
      const rsaKey = await rsa.genKeyPair(),
        plain = JSON.stringify(BIG_JSON)

      const encrypted = v2.encrypt(plain, {
        userSecret: ALICE,
        rsaKey: rsaKey.publicKey,
        isPubKey: true,
      })
      const decrypted = v2.decrypt(encrypted, {
        userSecret: ALICE,
        rsaKey: rsaKey.privateKey,
        isPubKey: false,
      })
      expect(decrypted).toEqual(plain)
    })
  })
})
