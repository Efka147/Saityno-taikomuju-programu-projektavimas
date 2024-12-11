import { connect } from 'mongoose';

export async function connectDB() {
    //PostmanTests
    //Database
    await connect(`mongodb://localhost:27017/PostmanTests`);
}
