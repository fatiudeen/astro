import { Schema, model } from 'mongoose';

const counterSchema = new Schema({
  model: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

const Counter = model('Counter', counterSchema);

// eslint-disable-next-line import/prefer-default-export
export const customIdPlugin = (schema: Schema, options: { modelName: string; code: string }) => {
  const { modelName, code } = options;

  // eslint-disable-next-line func-names
  schema.pre('save', async function (next) {
    const doc = this;

    if (!doc.isNew) {
      return next();
    }

    try {
      const counter = await Counter.findOneAndUpdate(
        { model: modelName },
        { $inc: { count: 1 } },
        { new: true, upsert: true },
      ).exec();

      doc.customId = `${code}${counter.count}`;

      return next();
    } catch (error: any) {
      return next(error);
    }
  });
};
