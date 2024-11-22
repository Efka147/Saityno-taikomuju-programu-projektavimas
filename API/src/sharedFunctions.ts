import { isValidObjectId } from 'mongoose';
import { STATUS_CODES } from 'http';
import { Request, Response } from 'express';
import { StatusCodes as CODES } from './routers/statusCodes';
import { Roles } from './db/schemas';
import jwt from 'jsonwebtoken';

export const isValidParam = (param: any, expectedType: 'string' | 'number' | 'objID') => {
    if (
        expectedType === 'string'
            ? param && typeof param === 'string' && param.length >= 2
            : expectedType === 'objID'
            ? param && isValidObjectId(param)
            : param !== undefined && param !== null && typeof param === 'number' && param > 0
    )
        return true;
    return false;
};

export const makeErrorMessage = (statusCode: number, message: string) => {
    return {
        code: statusCode,
        title: STATUS_CODES[statusCode],
        details: message,
    };
};

export const parsePayload = (req: Request, res: Response) => {
    const token = req.headers.authorization;
    if (!token) {
        res.status(CODES.AUTH.Unauthorized).json(makeErrorMessage(CODES.AUTH.Unauthorized, 'No access token'));
        return;
    }
    try {
        jwt.verify(token.replace(/^Bearer/, '').trim(), process.env.JWT_SECRET!);
    } catch {
        res.status(CODES.AUTH.Unauthorized).json(makeErrorMessage(CODES.AUTH.Unauthorized, 'Access token is not valid'));
        return;
    }
    return jwt.decode(token.replace(/^Bearer/, '').trim(), { json: true });
};
