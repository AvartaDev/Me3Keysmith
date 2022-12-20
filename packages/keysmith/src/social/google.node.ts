import _ from 'lodash'
import * as url from 'url'
import { Readable } from 'stream'
import { google } from 'googleapis'
import { Encoding } from 'crypto'
import { Provider } from './provider'

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
]

export default class Google implements Provider {
  private readonly _auth
  private readonly _drive
  private readonly _redirectUri: string

  constructor(credential: any) {
    this._redirectUri = credential.redirectUri
    this._auth = new google.auth.OAuth2(
      credential.clientId,
      credential.clientSecret,
      this._redirectUri,
    )

    google.options({ auth: this._auth })
    this._drive = google.drive({ version: 'v3' })
  }

  generateAuthUrl(): string | undefined {
    return this._auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    })
  }

  async authenticate(redirectUri: string): Promise<boolean> {
    let code: string = redirectUri
    if (
      _.startsWith(redirectUri, 'https://') ||
      _.startsWith(redirectUri, 'http://')
    ) {
      if (!_.startsWith(redirectUri, this._redirectUri)) return false

      const { query } = url.parse(redirectUri, true)
      code = _.get(query, 'code', '').toString()
    }
    if (_.isEmpty(code)) return false

    const { tokens } = await this._auth.getToken(code)
    console.log(tokens)
    this._auth.setCredentials(tokens)
    return true
  }

  async getUser(): Promise<any | undefined> {
    const googleAuth = google.oauth2({ version: 'v2' })
    const { data } = await googleAuth.userinfo.get()
    return data
  }

  async saveFile(body: Buffer, fileName: string, mimeType: string): Promise<string> {
    const file = await this._drive.files.create({
      requestBody: {
        name: fileName,
      },
      media: {
        mimeType,
        body: this._toReadable(body),
      },
      fields: 'id',
    })
    return file.data.id
  }

  async loadFile(fileId: string): Promise<any> {
    const file = await this._drive.files.get({
      fileId,
      alt: 'media',
    })
    return file.data
  }

  private _toReadable(data: string | Buffer, encoding?: Encoding): Readable {
    if (Buffer.isBuffer(data)) {
      return Readable.from(data)
    }
    return Readable.from(Buffer.from(data, encoding))
  }
}
