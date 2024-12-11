import { model, Schema, Document, Types, Model } from 'mongoose';
import { Roles } from '.';

export interface IUser extends Document {
    username: string;
    password: string;
    relation: { [key in Roles]: Types.ObjectId };
    role: Roles;
}

interface UserModel extends Model<IUser> {
    login(
        username: string,
        password: string
    ): Promise<
        | (Document<unknown, {}, IUser> &
              IUser &
              Required<{
                  _id: unknown;
              }> & {
                  __v?: number;
              })
        | null
    >;
    getSubjectId: (sub: string) => Promise<string>;
}

const userSchema = new Schema<IUser>({
    username: String,
    password: String,
    relation: Object,
    role: String,
});

userSchema.static('login', async function (username: string, password: string) {
    return await User.findOne({ username: username, password: password });
});
userSchema.static('getSubjectId', async function (sub: string) {
    const user = await User.findById(sub);
    return user!.relation![user!.role].toString()!;
});

export const User = model<IUser, UserModel>('user', userSchema);
