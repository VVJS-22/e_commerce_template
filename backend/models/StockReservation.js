const mongoose = require('mongoose');

const stockReservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'released', 'expired'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Index for quick lookup of active reservations by user
stockReservationSchema.index({ user: 1, status: 1 });
// Index for cleanup of expired reservations
stockReservationSchema.index({ expiresAt: 1, status: 1 });

module.exports = mongoose.model('StockReservation', stockReservationSchema);
