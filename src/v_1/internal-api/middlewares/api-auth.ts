//

import { Request, Response, NextFunction } from 'express';
import * as JWT from 'jsonwebtoken';
import { UserTypes } from '../../helpers/entities';
import { Jwt } from '../../helpers/env';

export const jwtAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
  userTypeToCheck: UserTypes,
): void | Response => {
  try {
    const token: string = req.headers['access-token']?.toString() || '';

    if (!token) return res.status(401).json({ Error: true, Msg: 'Unauthorized' });

    const decoded: any = JWT.verify(token, Jwt.JWT_SECRET || '');
    if (decoded.isRefreshToken) return res.status(400).json({ Error: true, Msg: 'User Token Is Invalid or Expired!' });

    if (!decoded.Usertype) return res.status(400).json({ Error: true, Msg: 'User Token Is Invalid or Expired!' });

    const Usertype: UserTypes = JSON.parse(decoded.types);

    if (Usertype.length === 0) return res.status(400).json({ Error: true, Msg: 'User Token Is Invalid or Expired!' });

    if (Usertype !== userTypeToCheck) res.status(401).json({ Error: true, Msg: 'Unauthorized' });

    req.userId = decoded.id;

    next();
  } catch (error) {
    res.status(400).json({ Error: true, Msg: `User Token Is Invalid or Expired!` });
  }
};
