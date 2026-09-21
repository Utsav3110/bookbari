import mongoose, { Document, Schema } from 'mongoose';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  role: { type: String, enum: Object.values(Role), default: Role.USER },
  status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
