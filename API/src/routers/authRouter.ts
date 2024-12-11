import { Router, Request, Response } from 'express';
import { StatusCodes as CODES } from './statusCodes';
import { User, Session, Roles } from '../db/schemas';
import { makeErrorMessage } from '../sharedFunctions';
import jwt from 'jsonwebtoken';
import { REFRESH_TOKEN_DURATION, TOKEN_DURATION } from '../constants';
import { nanoid } from 'nanoid';

const authRouter = Router();

const getCookie = (req: Request) => {
    const cookieObject: { [key: string]: string } = {};
    const cookies = req.headers.cookie;
    if (cookies) {
        cookies.split(';').forEach((cookie) => {
            const [key, value] = cookie.trim().split('=');
            cookieObject[key] = decodeURIComponent(value);
        });
    }
    return cookieObject?.RefreshToken;
};
const generateTokens = (userId: string, role: Roles, userRelations: { [key: string]: any }) => {
    const sharedProps = {
        subject: userId,
        audience: role,
        jwtid: nanoid(),
    };
    const now = Math.floor(Date.now() / 1000);
    const accessToken = jwt.sign({ iat: now, relations: userRelations }, process.env.JWT_SECRET!, {
        expiresIn: now + TOKEN_DURATION,
        ...sharedProps,
    });
    const refreshToken = jwt.sign({ iat: now, relations: userRelations }, process.env.JWT_SECRET!, {
        expiresIn: now + REFRESH_TOKEN_DURATION,
        ...sharedProps,
    });
    return { accessToken, refreshToken };
};

authRouter.post('/accessToken/:username/:password', async (req: Request, res: Response) => {
    const { username, password } = req.params;
    const user = await User.login(username, password);
    if (!user) {
        res.status(CODES.AUTH.UnprocessableEntry).json(makeErrorMessage(CODES.AUTH.UnprocessableEntry, 'Wrong username or password'));
        return;
    }
    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.relation);
    await Session.createSession(nanoid(), user.id, refreshToken, Math.floor(Date.now() / 1000) + TOKEN_DURATION);
    res.cookie('RefreshToken', refreshToken, { httpOnly: true, maxAge: REFRESH_TOKEN_DURATION * 1000 })
        .status(CODES.AUTH.AccessToken)
        .json({ accessToken });
});
authRouter.post('/refreshToken', async (req: Request, res: Response) => {
    const parsedRefreshToken = getCookie(req);
    if (parsedRefreshToken) {
        try {
            jwt.verify(parsedRefreshToken, process.env.JWT_SECRET!);
            const payload = jwt.decode(parsedRefreshToken, { json: true });
            const sesion = await Session.findOne({ userId: payload?.sub, lastRefreshToken: parsedRefreshToken });
            if (sesion?.isSessionValid()) {
                const { accessToken, refreshToken } = generateTokens(payload?.sub!, payload?.aud! as Roles, payload?.relations);
                await sesion.extendSession(refreshToken, Math.floor(Date.now() / 1000) + TOKEN_DURATION);
                res.clearCookie('RefreshToken')
                    .cookie('RefreshToken', refreshToken, { httpOnly: true, maxAge: REFRESH_TOKEN_DURATION * 1000 })
                    .status(CODES.AUTH.Renew)
                    .json({ accessToken });
                return;
            } else {
                res.status(CODES.AUTH.UnprocessableEntry).json(makeErrorMessage(CODES.AUTH.UnprocessableEntry, 'Session is expired or revoked'));
                return;
            }
        } catch {
            res.status(CODES.AUTH.UnprocessableEntry).json(makeErrorMessage(CODES.AUTH.UnprocessableEntry, 'Refresh token is not valid'));
            return;
        }
    }

    res.status(CODES.AUTH.UnprocessableEntry).json(makeErrorMessage(CODES.AUTH.UnprocessableEntry, 'Refresh token cookie was not found'));
});
authRouter.post('/logout', async (req: Request, res: Response) => {
    const refreshToken = getCookie(req);
    if (refreshToken) {
        try {
            jwt.verify(refreshToken, process.env.JWT_SECRET!);
            const payload = jwt.decode(refreshToken, { json: true });
            await Session.invalidateSession(refreshToken, payload?.sub!);
            res.status(CODES.AUTH.Logout).send();
            return;
        } catch {
            res.status(CODES.AUTH.UnprocessableEntry).json(makeErrorMessage(CODES.AUTH.UnprocessableEntry, 'Refresh token is not valid'));
            return;
        }
    }
    res.status(CODES.AUTH.UnprocessableEntry).json(makeErrorMessage(CODES.AUTH.UnprocessableEntry, 'Refresh token cookie was not found'));
});

export default authRouter;
