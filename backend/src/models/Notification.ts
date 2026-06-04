import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  message: string;
  type: 'application' | 'status' | 'job' | 'general';
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['application', 'status', 'job', 'general'],
      default: 'general',
    },
    read: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);