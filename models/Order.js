const { Schema, model, default: mongoose } = require("mongoose");

const OrderSchema = new Schema(
  {
    line_items: Object,
    name: String,
    email: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    paid: Boolean,
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || model("Order", OrderSchema);
