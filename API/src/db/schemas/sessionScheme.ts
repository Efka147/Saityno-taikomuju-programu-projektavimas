import { model, Schema, Document, Types, Model } from 'mongoose';

export interface ISession extends Document {
    sessionId: string;
    lastRefreshToken: string;
    initializedAt: number;
    expiresAt: number;
    isRevoked: boolean;
    userId: Types.ObjectId;
}

interface SessionModel extends Model<ISession, {}, iSessionMethods> {
    createSession: (
        sessionId: string,
        userId: Types.ObjectId,
        refreshToken: string,
        expiresAt: number
    ) => Promise<
        Document<unknown, {}, ISession> &
            ISession &
            Required<{
                _id: unknown;
            }> & {
                __v?: number;
            }
    >;
    invalidateSession: (refreshToken: string, userId: string) => Promise<void>;
}
interface iSessionMethods {
    isSessionValid: () => boolean;
    extendSession: (refreshToken: string, expiresAt: number) => Promise<void>;
}

const sessionSchema = new Schema<ISession>({
    sessionId: String,
    lastRefreshToken: String,
    initializedAt: Number,
    expiresAt: Number,
    isRevoked: Boolean,
    userId: Types.ObjectId,
});

sessionSchema.static('createSession', async function (sessionId: string, userId: Types.ObjectId, refreshToken: string, expiresAt: number) {
    return await Session.create({ sessionId, userId, lastRefreshToken: refreshToken, expiresAt, isRevoked: false });
});

sessionSchema.method('extendSession', async function (refreshToken: string, expiresAt: number) {
    this.expiresAt = expiresAt;
    this.lastRefreshToken = refreshToken;
    this.save();
});
sessionSchema.static('invalidateSession', async function (refreshToken: string, userId: string) {
    await Session.updateOne({ lastRefreshToken: refreshToken, userId }, { isRevoked: true });
});
sessionSchema.method('isSessionValid', function () {
    if (this.expiresAt > Math.floor(Date.now() / 1000) && this.isRevoked !== true) return true;
    return false;
});

export const Session = model<ISession, SessionModel>('session', sessionSchema);
