/* eslint-disable func-names */
import { model, Schema, Model } from 'mongoose';
// import bcrypt from 'bcrypt';
import { UserInterface } from '@interfaces/User.Interface';
import shortUUID from 'short-uuid';

const userSchema = new Schema<UserInterface & { _id: string }>(
  {
    _id: { type: String, default: shortUUID().uuid, index: true },
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
      enum: ['user', 'admin'],
      default: 'user',
    },
    verifiedEmail: Boolean,
    verificationToken: String,
    avatar: String,
    resetToken: String,
  },
  {
    timestamps: true,
    toObject: {
      transform(doc, ret) {
        delete ret._id;
        ret.id = shortUUID().fromUUID(doc._id);
      },
    },
  },
);

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) next();

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);

//   next();
// });

// userSchema.methods.comparePasswords = async function (password: string) {
//   // eslint-disable-next-line no-return-await
//   return await bcrypt.compare(password, this.password);
// };

// userSchema.methods.getSignedToken = function () {
//   // eslint-disable-next-line no-underscore-dangle
//   return jwt.sign({ id: this._id }, JWT_KEY, { expiresIn: JWT_TIMEOUT });
// };

// userSchema.methods.toJSON = function() {
//   const user = this;
//   return omit(user.toObject(), ['password']);
// };

// userSchema.methods.transform = function() {
//   const user = this;
//   return pick(user.toJSON(), ['id', 'email', 'name', 'age', 'role']);
// };

export default <Model<UserInterface & { _id: string }>>model('User', userSchema);
