import { config } from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV === 'development') {
  config({ path: '.env.dev' });
} else config();

export const MESSAGES = {
  DB_CONNECTED: 'database connected',
  ADMIN_SEEDED: 'database connected',
  INTERNAL_SERVER_ERROR: 'Internal Server Error. Please try again!',
  INVALID_CREDENTIALS: 'Invalid Credentials',
  LOGIN_SUCCESS: 'Login Success',
  UNAUTHORIZED: 'Unauthorized access',
  INPUT_VALIDATION_ERROR: 'Input Validation Error',
  INVALID_REQUEST: 'Invalid Request',
  ROUTE_DOES_NOT_EXIST: 'Sorry Route does not exists',
  SERVER_STARTED: 'Server running on port',
  MONGODB_CONNECTED: 'DB Connected',
  MIN_PASSWORD_ERROR: 'password cannot be less than six',
  PASSWORD_MATCH_ERROR: 'password does not match',
  SEED_ACCOUNT_CREATED: 'Seeded',
  INVALID_EMAIL: 'invalid email',
  SHORT_PASSWORD: 'password must be at least 8 characters',
  USER_EXISTS: 'user exists',
  INVALID_RECORD: 'record does not exist',
  INVALID_SESSION: 'user does not have an active session',
  ACTIVE_SESSION: 'user session is active on another device. login again to reclaim session',
  DOC_NOT_FOUND: 'documentation url not found',
  PAYSTACK_NOT_INITIALIZED: 'paystack not initialized',
};

export const {
  PORT,
  DB_URI,
  JWT_KEY,
  JWT_TIMEOUT,
  REFRESH_JWT_KEY,
  REFRESH_JWT_TIMEOUT,
  GOOGLE_API_CLIENT_ID,
  GOOGLE_API_CLIENT_SECRET,
  GOOGLE_API_REDIRECT,
  API_HOST,
  FRONTEND_GOOGLE_LOGIN_URI,
  FACEBOOK_API_CLIENT_ID,
  FACEBOOK_API_CLIENT_SECRET,
  FACEBOOK_API_REDIRECT,
  FRONTEND_FACEBOOK_LOGIN_URI,
  APPLE_API_CLIENT_ID,
  APPLE_API_REDIRECT,
  APPLE_API_CLIENT_SECRET,
  APPLE_TEAM_ID,
  APPLE_KEY_IDENTIFIER,
  SENDGRID_API_KEY,
  DOMAIN_EMAIL,
  SEEDER_EMAIL,
  SEEDER_PASSWORD,
  DOCS_URL,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  PAYSTACK_SECRET,
  MULTER_STORAGE_PATH,
  NODE_ENV,
} = <Record<string, string>>process.env;

export const CONSTANTS = {
  DIGITALOCEAN_SPACE_ENDPOINT: '',
  ROOT_PATH: path.join(__dirname, '..', '..', MULTER_STORAGE_PATH || ''),
};

export const OPTIONS: Record<string, boolean> = {
  USE_ADMIN_SEED: false,
  USE_EMAILING: false,
  USE_SOCKETS: false,
  USE_AUTH_SESSIONS: false, // one user can log in at a time
  USE_REFRESH_TOKEN: false,
  USE_MULTER: false, // using multer without s3 or disk storage set default storage to memoryStorage
  USE_S3: false,
  USE_DIGITALOCEAN_SPACE: false, // s3 must be true to use this
  USE_MULTER_DISK_STORAGE: false, // s3 and USE_DIGITALOCEAN_SPACE  must be false to use this
  USE_OAUTH_GOOGLE: false,
  USE_OAUTH_FACEBOOK: false,
  USE_OAUTH_APPLE: false,
  USE_PAYSTACK: false,
  USE_ANALYTICS: false,
};

export function optionsValidation() {
  if (!PORT || !DB_URI || !JWT_KEY || !JWT_TIMEOUT) {
    throw new Error('missing env config options: PORT, DB_URI, JWT_TIMEOUT, JWT_KEY');
  }
  if (OPTIONS.USE_ADMIN_SEED) {
    if (!SEEDER_EMAIL || !SEEDER_PASSWORD) {
      throw Error('missing env config options: SEEDER_EMAIL, SEEDER_PASSWORD');
    }
  }

  if (OPTIONS.USE_EMAILING) {
    if (!SENDGRID_API_KEY) {
      throw Error('missing env config options: SENDGRID_API_KEY');
    }
  }

  if (OPTIONS.USE_PAYSTACK) {
    if (!PAYSTACK_SECRET) {
      throw Error('missing env config options: PAYSTACK_SECRET');
    }
  }

  if (OPTIONS.USE_MULTER_DISK_STORAGE) {
    if (!OPTIONS.USE_MULTER) {
      throw new Error('USE_MULTER option must be set to true to use USE_MULTER_DISK_STORAGE');
    }

    if (OPTIONS.USE_DIGITALOCEAN_SPACE || OPTIONS.USE_S3) {
      throw new Error(
        'USE_S3 and USE_DIGITALOCEAN_SPACE option must be set to false to use USE_MULTER_DISK_STORAGE',
      );
    }

    if (!MULTER_STORAGE_PATH) {
      throw new Error('missing env config options: MULTER_STORAGE_PATH');
    }
  }

  if (OPTIONS.USE_DIGITALOCEAN_SPACE) {
    if (!OPTIONS.USE_S3) {
      throw new Error('USE_S3 option must be set to true to use USE_DIGITALOCEAN_SPACE');
    }
  }

  if (OPTIONS.USE_REFRESH_TOKEN) {
    if (!REFRESH_JWT_KEY || !REFRESH_JWT_TIMEOUT) {
      throw Error('missing env config options: REFRESH_JWT_KEY, REFRESH_JWT_TIMEOUT');
    }
  }

  if (OPTIONS.USE_S3) {
    if (!OPTIONS.USE_MULTER) {
      throw new Error('USE_MULTER option must be set to true to use USE_S3');
    }
    if (!AWS_BUCKET_NAME || !AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error(
        'missing env config options: AWS_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY',
      );
    }
  }

  if (OPTIONS.USE_OAUTH_GOOGLE) {
    if (
      !API_HOST ||
      !GOOGLE_API_CLIENT_ID ||
      !GOOGLE_API_CLIENT_SECRET ||
      !GOOGLE_API_REDIRECT ||
      !FRONTEND_GOOGLE_LOGIN_URI
    ) {
      throw new Error(
        'missing env config options: API_HOST, GOOGLE_API_CLIENT_ID, GOOGLE_API_CLIENT_SECRET, GOOGLE_API_REDIRECT, FRONTEND_GOOGLE_LOGIN_URI',
      );
    }
  }

  if (OPTIONS.USE_OAUTH_FACEBOOK) {
    if (
      !API_HOST ||
      !FACEBOOK_API_CLIENT_ID ||
      !FACEBOOK_API_CLIENT_SECRET ||
      !FACEBOOK_API_REDIRECT ||
      !FRONTEND_FACEBOOK_LOGIN_URI
    ) {
      throw new Error(
        'missing env config options: API_HOST, FACEBOOK_API_CLIENT_ID, FACEBOOK_API_CLIENT_SECRET, FACEBOOK_API_REDIRECT, FRONTEND_FACEBOOK_LOGIN_URI',
      );
    }
  }

  if (OPTIONS.USE_OAUTH_APPLE) {
    if (
      !API_HOST ||
      !APPLE_API_CLIENT_ID ||
      !APPLE_API_REDIRECT ||
      !APPLE_API_CLIENT_SECRET ||
      !APPLE_TEAM_ID ||
      !APPLE_KEY_IDENTIFIER
    ) {
      throw new Error(
        'missing env config options: API_HOST, APPLE_API_CLIENT_ID, APPLE_API_REDIRECT, APPLE_API_CLIENT_SECRET, APPLE_TEAM_ID, APPLE_KEY_IDENTIFIER ',
      );
    }
  }
}
