import crypto from 'crypto';

export default () => {
  // return crypto.randomBytes(48).toString('hex');
  return Math.floor(100000 + Math.random() * 900000).toString();
};
