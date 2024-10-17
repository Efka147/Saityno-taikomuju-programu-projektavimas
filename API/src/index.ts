import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { connectDB } from './db';
import { supplierRouter, warehouseRouter, goodRouter } from './routers';

config();

const Port = 3000;

connectDB().then(() => console.log('Connected'));

const app = express();
app.use(cors());
app.use(express.json());
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({ message: 'Invalid JSON in request body' });
        return;
    }
});

app.use('/api', supplierRouter);
app.use('/api', warehouseRouter);
app.use('/api', goodRouter);

app.use((_req: Request, res: Response) => {
    res.status(404).send({ message: 'Endpoint not found' });
});

console.log(`App listen at port ${Port}`);
app.listen(Port);
