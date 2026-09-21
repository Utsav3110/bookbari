import mongoose, { Document, Schema } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<IAuthor>({
  name: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

export const Author = mongoose.model<IAuthor>('Author', authorSchema);
