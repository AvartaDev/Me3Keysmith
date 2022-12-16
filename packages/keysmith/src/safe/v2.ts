import _ from 'lodash'
import { randomBytes } from 'crypto'
import * as aes from './aes'
import * as rsa from './rsa'
import * as chacha from './chacha'
import { CommData, CommSecret, UserSecret } from '../types'

function _getRawPwd(secret: UserSecret): { password: string, salt: string } {
  const { key, salt, password } = secret
  const decrypted = aes.decrypt(key, password, salt)
  return { salt, password: decrypted }
}

export function encrypt(plain: string, commSecure: CommSecret): CommData {
  if (!_.isEmpty(commSecure.userSecret)) {
    const { password, salt } = _getRawPwd(commSecure.userSecret)
    plain = aes.encrypt(plain, password, salt)
  }

  const chachaKey = randomBytes(32)
  const data = chacha.encrypt(
    chachaKey,
    Buffer.from(plain, 'utf8')
  ).toString('base64')
  const secret = rsa.encrypt(
    commSecure.rsaKey,
    chachaKey,
    commSecure.isPubKey
  ).toString('base64')
  return { data, secret }
}

export function decrypt(data: CommData, commSecure: CommSecret): string {
  const chachaKey = rsa.decrypt(
    commSecure.rsaKey,
    Buffer.from(data.secret, 'base64'),
    commSecure.isPubKey
  )
  const decryped = chacha.decrypt(
    chachaKey,
    Buffer.from(data.data, 'base64')
  )

  const ret = decryped.toString('utf8')
  if (_.isEmpty(commSecure.userSecret)) {
    return ret
  }
  const { password, salt } = _getRawPwd(commSecure.userSecret)
  return aes.decrypt(ret, password, salt)
}
