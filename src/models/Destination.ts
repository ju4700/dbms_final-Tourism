import mongoose, { Schema, Document } from 'mongoose';

export interface IDestination extends Document {
  name: string;
  country: string;
  description?: string;
  popularAttractions?: string[];
  bestTimeToVisit?: string;
  averageCost?: number;
}

const DestinationSchema = new Schema<IDestination>({
  name: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  description: { type: String, required: false },
  popularAttractions: [{ type: String }],
  bestTimeToVisit: { type: String, required: false },
  averageCost: { type: Number, required: false }
});

export default mongoose.models.Destination || mongoose.model<IDestination>('Destination', DestinationSchema);
