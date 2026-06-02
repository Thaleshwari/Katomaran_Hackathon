const mongoose = require('mongoose');

const UrlMappingSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Configure Schema to serialize virtual 'id'
UrlMappingSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UrlMappingSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('UrlMapping', UrlMappingSchema);
