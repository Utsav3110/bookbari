import mongoose, { Document, Schema } from 'mongoose';

export interface ILanguage extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const languageSchema = new Schema<ILanguage>({
  name: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

export const Language = mongoose.model<ILanguage>('Language', languageSchema);
