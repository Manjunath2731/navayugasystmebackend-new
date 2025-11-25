import mongoose, { Document, Schema } from 'mongoose';

export interface ILinkage extends Document {
  name: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LinkageSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<ILinkage>('Linkage', LinkageSchema);

