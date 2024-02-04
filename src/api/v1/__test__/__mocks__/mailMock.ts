import Emailing from '@helpers/mailer';

const data = {
  status: 201,
  id: '<20220612040030.590cb653cdd3359f@sandboxe356c98d9eb1425087f300dd7df32c68.mailgun.org>',
  message: 'Queued. Thank you.',
} as any;

export default jest.spyOn(Emailing!, 'send').mockResolvedValue(data);
