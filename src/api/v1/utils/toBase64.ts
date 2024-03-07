export default (data: string, decrypt = false) => {
  if (decrypt) {
    return Buffer.from(data, 'base64').toString('utf-8');
  }
  return Buffer.from(data).toString('base64');
};
