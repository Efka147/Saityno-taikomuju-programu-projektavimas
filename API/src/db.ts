import { connect } from 'mongoose';

export async function connectDB() {
    await connect(`mongodb://localhost:27017/Database`);
}
