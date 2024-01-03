export enum MediaTypeEnum {
  VIDEO = 'video',
  IMAGE = 'image',
}

export type IMedia = {
  url: string;
  type: MediaTypeEnum;
};

export type IPhoneNumber = {
  countryCode: string;
  number: string;
};

export enum TxnTypeEnum {
  CREDIT = 'credit',
  DEBIT = 'debit',
}
