export interface Provider {
  generateAuthUrl(): string | undefined
  authenticate(redirect: string | undefined): Promise<boolean>
  getUser(): Promise<any | undefined>
  saveFile(body: Buffer, fileName: string, mimeType: string): Promise<string>
  loadFile(fileId: string): Promise<any>
}
