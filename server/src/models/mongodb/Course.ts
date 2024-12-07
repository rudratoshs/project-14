import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface defining the structure of a Course document.
 */
export interface ICourse extends Document {
  title: string;
  description: string;
  type: 'image_theory' | 'video_theory';
  accessibility: 'free' | 'paid' | 'limited';
  thumbnail?: string;
  banner?: string;
  topics: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
    status: 'incomplete' | 'complete';
    thumbnail?: string;
    banner?: string;
    subtopics?: Array<{
      id: string;
      title: string;
      content: string;
      order: number;
      status: 'incomplete' | 'complete';
      thumbnail?: string;
      banner?: string;
    }>;
  }>;
  jobId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the Course model
const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['image_theory', 'video_theory'],
      required: true,
    },
    accessibility: {
      type: String,
      enum: ['free', 'paid', 'limited'],
      required: true,
    },
    thumbnail: { type: String },
    banner: { type: String },
    jobId: { type: String },
    userId: { type: String, required: true },
    topics: [
      {
        id: {
          type: String,
          default: () => new mongoose.Types.ObjectId().toString(),
        },
        title: { type: String },
        content: { type: String },
        order: { type: Number },
        status: {
          type: String,
          enum: ['incomplete', 'complete'],
          default: 'incomplete',
        },
        thumbnail: { type: String },
        banner: { type: String },
        subtopics: [
          {
            id: {
              type: String,
              default: () => new mongoose.Types.ObjectId().toString(),
            },
            title: { type: String },
            content: { type: String },
            order: { type: Number },
            status: {
              type: String,
              enum: ['incomplete', 'complete'],
              default: 'incomplete',
            },
            thumbnail: { type: String },
            banner: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Virtual property to generate the full URL for the thumbnail
CourseSchema.virtual('thumbnailUrl').get(function () {
  if (!this.thumbnail) return null;
  const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}${this.thumbnail}`;
});

// Virtual property to generate the full URL for the banner
CourseSchema.virtual('bannerUrl').get(function () {
  if (!this.banner) return null;
  const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}${this.banner}`;
});

// Ensure virtual properties are included in JSON responses
CourseSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id; // Replace `_id` with `id`
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Create and export the Course model
const Course = mongoose.model<ICourse>('Course', CourseSchema);

export default Course;