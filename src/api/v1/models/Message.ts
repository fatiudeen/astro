import { model, Schema } from 'mongoose';
import { MessageInterface } from '@interfaces/Message.Interface';
import { IMedia, MediaTypeEnum } from '@interfaces/Common.Interface';

const MessageSchema = new Schema<MessageInterface>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: false,
    },
    media: new Schema<IMedia>({
      url: String,
      type: {
        type: String,
        enum: Object.values(MediaTypeEnum),
      },
    }),
    seen: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true },
);

export default model('Message', MessageSchema);
