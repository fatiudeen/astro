import { Request, Response } from 'express';
import { DOCS_URL } from '@config';

const docs = (req: Request, res: Response) => {
  res.redirect(<string>DOCS_URL);
};

export default docs;
