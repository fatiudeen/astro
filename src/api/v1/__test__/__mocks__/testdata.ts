import { ElectricityPurchase, Accounts } from '@prisma/client';

export const txnData = {
  Id: 3,
  MeterNumber: '62130168420',
  ServiceType: 'abuja_electric_prepaid',
  UserId: 7,
  AmountPaid: '500',
  ValueGotten: '500',
  Charges: '0',
  Token: '1454-6815-2285-0736-6018',
  IsBeneficiary: false,
  IsMoneyRecieved: true,
  ElectricitySupplyStatus: 1,
  TransactionSource: 1,
  TransactionReference: '8648d6ee5fa048c8842d494e7a95f91c',
  DateCreated: '2022-05-01T19:45:21.596Z',
  IsClosedBySupport: false,
  DateUpdated: null,
  IsDeleted: false,
  CreatedBy: 0,
} as unknown as ElectricityPurchase;
export const userData = {
  Id: 7,
  PhoneNumber: '09095039977',
  FirstName: 'Ifeanyi ',
  LastName: 'Ukwuoma ',
  Email: 'iukwuoma@gmail.com',
  MeterNumber: '04277811396',
  DistributionCompany: 'ikeja_electric_prepaid',
  ProfilePicture: '99cb8de017ad436bbfba2661e8deda86_unnamed (8).jpg',
  PasswordHash: '$2a$11$xX6hXEhqWXyHq3IG8Nf58Olyi5FKyZK.CzGYHvIFMbP7mjs/kgiAa',
  AcceptTerms: true,
  Role: 1,
  VerificationToken: null,
  FirebaseToken:
    'f0S7yAozQzqoteYCmwKZsM:APA91bGmYwaEUC9sb9ek68F3r60ylHrHC9PPfmJkMzgVjhk0M4h8J5n6Rbd9vllvtyvgGA8fK6bT7FNuuF0bmGmmiMfCEcaCu3O24w1I8SgEF9Fw3U8uFaujRNlB3rQxFaDDdz4pcjMJ',
  PowerfullId: 'POW294515',
  TokenDate: '2022-05-01T19:37:17.061Z',
  IsAdminCreated: null,
  Verified: '2022-05-01T19:37:52.798Z',
  ResetToken: '417167',
  ResetTokenExpires: '2022-05-03T19:08:56.430Z',
  PasswordReset: null,
  DateCreated: '2022-05-01T19:37:17.061Z',
  DateUpdated: '2022-05-14T11:14:34.927Z',
  IsDeleted: false,
  CreatedBy: 0,
} as unknown as Accounts;

export const user = { email: 'shehufatiudeen@gmail.com', password: 'deen1234' };
