import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import createHttpError from "http-errors";
import { randomBytes } from 'crypto';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';
import { SessionsCollection } from '../db/models/session.js';

export const registerUser = async (payload) => {
  const { email, password } = payload;
  const user = await UsersCollection.findOne({ email });
  if (user) {
    throw createHttpError(409, "Email already exist");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const data = await UsersCollection.create({...payload, password: hashPassword});
  delete data._doc.password;

  return data._doc;
};

export const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password invalid');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(Date.now() + ONE_DAY);

  const userSession = await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil
  });

  return userSession;
};

// export const logoutUser = async (sessionId) => {
//   await SessionsCollection.deleteOne({ _id: sessionId });
// };

// const createSession = () => {
//   const accessToken = randomBytes(30).toString('base64');
//   const refreshToken = randomBytes(30).toString('base64');

//   return {
//     accessToken,
//     refreshToken,
//     accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
//     refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
//   };
// };

// export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
//   const session = await SessionsCollection.findOne({
//     _id: sessionId,
//     refreshToken,
//   });

//   if (!session) {
//     throw createHttpError(401, 'Session not found');
//   }

//   const isSessionTokenExpired =
//     new Date() > new Date(session.refreshTokenValidUntil);

//   if (isSessionTokenExpired) {
//     throw createHttpError(401, 'Session token expired');
//   }

//   const newSession = createSession();

//   await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

//   return await SessionsCollection.create({
//     userId: session.userId,
//     ...newSession,
//   });
// };

export const findSessionByAccessToken = accessToken => SessionsCollection.findOne({ accessToken });

export const findUser = filter => UsersCollection.findOne(filter);
