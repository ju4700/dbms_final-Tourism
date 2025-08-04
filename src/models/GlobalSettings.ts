import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalSettings extends Document {
  touristTableColumns: Record<string, boolean>;
  updatedAt: Date;
  updatedBy: string;
}

const GlobalSettingsSchema = new Schema<IGlobalSettings>({
  touristTableColumns: { type: Object, required: true },
  updatedAt: { type: Date, required: true },
  updatedBy: { type: String, required: true }
});

export default mongoose.models.GlobalSettings ||
  mongoose.model<IGlobalSettings>('GlobalSettings', GlobalSettingsSchema);
