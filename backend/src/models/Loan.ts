import mongoose, { Document, Schema, Types } from 'mongoose';

export enum LoanStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED'
}

export interface ILoan extends Document {
  bookId: Types.ObjectId;
  borrowerName: string;
  borrowerSurname: string;
  borrowerMobile: string;
  issuedById: Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: LoanStatus;
  createdAt: Date;
}

const loanSchema = new Schema<ILoan>({
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowerName: { type: String, default: 'Unknown' },
  borrowerSurname: { type: String, default: 'Unknown' },
  borrowerMobile: { type: String, default: 'Unknown' },
  issuedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: Object.values(LoanStatus), default: LoanStatus.BORROWED }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

loanSchema.index({ bookId: 1 });
loanSchema.index({ borrowerMobile: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ status: 1, dueDate: 1 });
loanSchema.index({ status: 1, bookId: 1 });
loanSchema.index({ bookId: 1, status: 1, dueDate: 1 });

export const Loan = mongoose.model<ILoan>('Loan', loanSchema);
