/* eslint-disable func-names */
import { model, Schema, Model } from 'mongoose';
// import bcrypt from 'bcrypt';
import { UserInterface, UserRole, UserSex } from '@interfaces/User.Interface';
import { IMedia, MediaTypeEnum } from '@interfaces/Common.Interface';

const userSchema = new Schema<UserInterface>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      minlength: 8,
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    verifiedEmail: Boolean,
    verificationToken: String,
    avatar: new Schema<IMedia>({
      url: String,
      type: {
        type: String,
        enum: Object.values(MediaTypeEnum),
      },
    }),
    resetToken: String,
    firstName: String,
    lastName: String,
    verifiedPhoneNumber: Boolean,
    hasPassword: Boolean,
    username: { type: String, index: true, unique: true },
    dob: String,
    sex: {
      type: String,
      enum: Object.values(UserSex),
      default: UserSex.OTHERS,
    },
    phoneNumber: {
      countryCode: String,
      number: String,
    },
    location: String, // TODO:
    address: String,
    followers: Number,
    following: Number,
    isFollower: Boolean,
    isFollowing: Boolean,
    winningStreak: Number,
    online: Boolean,
    socketId: String,
    totalWinning: Number,
    totalGames: Number,
    profile: {
      about: String,
      league: String,
      frequency: String,
      betPerformance: String,
    },
    resetTokenExpiry: Date,
  },
  {
    timestamps: true,
    toObject: {
      // transform(doc, ret) {
      // delete ret._id;
      // ret.id = shortUUID().fromUUID(doc._id);
      // },
    },
  },
);

export default <Model<UserInterface>>model('User', userSchema);
