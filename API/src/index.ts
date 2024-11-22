import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { connectDB } from './db';
import { supplierRouter, authRouter } from './routers';
import { makeErrorMessage, parsePayload } from './sharedFunctions';
import { StatusCodes as CODES } from './routers/statusCodes';
import { Roles, User } from './db/schemas';
config();
const Port = 3000;

connectDB().then(() => console.log('Connected'));

const app = express();

const globalAuthorizationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const payload = parsePayload(req, res);
    if (!payload) return;
    if (payload?.aud === Roles.ADMIN) {
        next();
        return;
    }
    const subject = await User.getSubjectId(payload.sub!);
    const [supplierId, warehouseId, goodId] = req.url.split('/').filter((v) => v.length === 24);

    if (supplierId !== subject && warehouseId !== subject && goodId !== subject) {
        res.status(CODES.AUTH.Forbidden).json(makeErrorMessage(CODES.AUTH.Forbidden, 'Not allowed'));
        return;
    }
    next();
};

app.use(cors());
app.use(express.json());
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({ message: 'Invalid JSON in request body' });
        return;
    }
});

app.use('/api', authRouter);
app.use('/api', globalAuthorizationMiddleware, supplierRouter);

app.use((_req: Request, res: Response) => {
    res.status(404).send({ message: 'Endpoint not found' });
});

console.log(`App listen at port ${Port}`);
app.listen(Port);
