import cors from 'cors';
import express from 'express';
import { config } from 'dotenv';
import { connectDB } from './db';
import { supplierRouter } from './routers';

config();

const Port = 3000;

connectDB().then(() => console.log('Connected'));

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', supplierRouter);

console.log(`App listen at port ${Port}`);
app.listen(Port);
