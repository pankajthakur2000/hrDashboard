import mongoose, { Schema } from "mongoose";
import { MongoClient, ServerApiVersion } from "mongodb";

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
  const uri = process.env.MONGODB_URI as string;
  if (!uri) throw new Error("MONGODB_URI is required");

  // First, use the native MongoDB driver (your preferred code) to verify the connection.
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });

  await client.connect();
  await client.db("admin").command({ ping: 1 });
  await client.close();

  // Then connect Mongoose so the rest of the app (models, queries) continues to work.
  if (!connectPromise) {
    mongoose.set("strictQuery", true);
    connectPromise = mongoose.connect(uri);
  }

  return connectPromise;
}


