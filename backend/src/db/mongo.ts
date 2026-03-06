import mongoose, { Schema } from "mongoose";

export type AttendanceStatus = "PRESENT" | "ABSENT";

const EmployeeSchema = new Schema(
  {
    employeeId: { type: String, required: true, unique: true, index: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, trim: true },
    department: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const AttendanceSchema = new Schema(
  {
    employeeId: { type: String, required: true, index: true, trim: true },
    date: { type: String, required: true, index: true, trim: true }, // YYYY-MM-DD
    status: { type: String, required: true, enum: ["PRESENT", "ABSENT"] }
  },
  { timestamps: true }
);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export type EmployeeDoc = {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AttendanceDoc = {
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const Employee =
  (mongoose.models.Employee as mongoose.Model<EmployeeDoc> | undefined) ??
  mongoose.model<EmployeeDoc>("Employee", EmployeeSchema);

export const Attendance =
  (mongoose.models.Attendance as mongoose.Model<AttendanceDoc> | undefined) ??
  mongoose.model<AttendanceDoc>("Attendance", AttendanceSchema);

let connectPromise: Promise<typeof mongoose> | null = null;

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");

  if (!connectPromise) {
    // Keep queries predictable; avoid silent coercions.
    mongoose.set("strictQuery", true);
    connectPromise = mongoose.connect(uri);
  }

  return connectPromise;
}


