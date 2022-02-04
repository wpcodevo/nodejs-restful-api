const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      trim: true,
      unique: true,
      minLength: [10, 'Tour name must be less than 10 characters'],
      maxLength: [50, 'Tour name must be greater than 50 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour must have a duration'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Tour difficulty must be either easy, medium or difficult',
      },
    },
    price: {
      type: Number,
      required: [true, 'Tour must have a price'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a max group size'],
    },
    summary: {
      type: String,
      required: [true, 'Tour must have a summary'],
      minLength: [10, 'Tour summary must be more than 10 characters'],
      maxLength: [85, 'Tour summary must be less than 85 characters'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have an image cover'],
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be more than 1'],
      max: [5, 'Rating must be less than 5'],
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    images: [String],
    startDates: [Date],
    startLocation: {
      type: {
        type: 'String',
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: Array,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Tour', tourSchema);
