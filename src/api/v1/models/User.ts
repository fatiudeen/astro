/* eslint-disable func-names */
import { model, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserInterface } from '@interfaces/User.Interface';
import jwt from 'jsonwebtoken';
import { JWT_KEY } from '@config';

const userSchema = new Schema<UserInterface>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      minlength: 8,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    session: { type: Boolean, default: false },
    verifiedEmail: Boolean,
    verificationToken: String,
    avatar: String,
    resetToken: String,
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.comparePasswords = async function (password: string) {
  // eslint-disable-next-line no-return-await
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.getSignedToken = function () {
  // eslint-disable-next-line no-underscore-dangle
  return jwt.sign({ id: this._id }, <string>JWT_KEY, {});
};

export default <Model<UserInterface>>model('user', userSchema);
