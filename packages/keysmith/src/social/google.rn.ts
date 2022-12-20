import _ from 'lodash'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { GDrive } from '@robinbobin/react-native-google-drive-api-wrapper'
import { Provider } from './provider'

// const SCOPES = [
//   'https://www.googleapis.com/auth/userinfo.email',
//   'https://www.googleapis.com/auth/drive',
//   'https://www.googleapis.com/auth/drive.file',
// ]

export default class Google implements Provider {
  private readonly _drive: GDrive

  constructor(credential: any) {
    GoogleSignin.configure(credential)
    this._drive = new GDrive()
  }

  generateAuthUrl(): string | undefined {
    return undefined
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async authenticate(redirect: string | undefined): Promise<boolean> {
    await GoogleSignin.hasPlayServices()
    const userInfo = await GoogleSignin.signIn()
    console.log('Google login result', userInfo)
    if (_.isEmpty(userInfo)) return false

    this._drive.accessToken = (await GoogleSignin.getTokens()).accessToken
    return true
  }

  async getUser(): Promise<any | undefined> {
    const { user } = await GoogleSignin.getCurrentUser()
    return user
  }

  async saveFile(body: Buffer, fileName: string, mimeType: string): Promise<string> {
    const uploader = this._drive.files.newMediaUploader()

    if (Buffer.isBuffer(body)) {
      uploader.setData(Uint8Array.from(body), mimeType)
    } else {
      uploader.setData(JSON.stringify(body), mimeType)
    }
    uploader.setRequestBody({
      name: fileName,
    })
    const result = await uploader.execute()
    return result.id
  }

  async loadFile(fileId: string): Promise<any> {
    const file = await this._drive.files.getContent(fileId)
    return file.data
  }
}
