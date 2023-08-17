import { Schema, model, models } from "node_modules/mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true },
  parent: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: "Category",
    required: false,
  },
  properties: [{ type: Object }],
});

export const Category = models.Category || model("Category", CategorySchema);
