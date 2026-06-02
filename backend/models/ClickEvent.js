const mongoose = require('mongoose');

const ClickEventSchema = new mongoose.Schema({
  clickDate: {
    type: Date,
    default: Date.now,
  },
  urlMapping: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UrlMapping',
    required: true,
  },
  country: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    default: 'Desktop',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  referrer: {
    type: String,
    default: 'Direct',
  },
});

// Configure Schema to serialize virtual 'id'
ClickEventSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ClickEventSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('ClickEvent', ClickEventSchema);
