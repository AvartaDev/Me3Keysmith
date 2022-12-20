const DriveName = {
  qr: 'ME3_QR',
  json: 'ME3_KEY.json',
}

interface ME3Config {
  endpoint: string;
  partnerId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface RsaKey {
  privateKey: string;
  publicKey: string;
}

interface UserSecret {
  uid: string;
  salt: string;
  password: string; // Private or Public RSA
  key: string;
}
interface CommSecret {
  userSecret?: UserSecret;
  rsaKey: string; // Private or Public RSA
  isPubKey: boolean;
}

interface CommData {
  secret: string;
  data: string;
}

export { DriveName, ME3Config, RsaKey, UserSecret, CommSecret, CommData }
