import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBook extends Document {
  title: string;
  authorId: Types.ObjectId;
  language: string;
  genre?: string;
  totalQuantity: number;
  description?: string;
  coverUrl?: string;
  addedById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const bookSchema = new Schema<IBook>({
  title: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
  language: { type: String, required: true },
  genre: { type: String },
  totalQuantity: { type: Number, default: 1 },
  description: { type: String },
  coverUrl: { type: String },
  addedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deletedAt: { type: Date }
}, {
  timestamps: true
});

bookSchema.index({ title: 1 });
bookSchema.index({ authorId: 1 });
bookSchema.index({ language: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ deletedAt: 1, createdAt: -1 });
bookSchema.index({ authorId: 1, deletedAt: 1 });

export const Book = mongoose.model<IBook>('Book', bookSchema);
