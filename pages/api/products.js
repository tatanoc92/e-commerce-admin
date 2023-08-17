import { Product } from "@/models/Product";
import { mongooseConnect } from "../../lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
  console.log("handle");
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method == "GET") {
    if (req.query?.id) {
      return res.json(await Product.findOne({ _id: req.query.id }));
    } else {
      return res.json(await Product.find());
    }
  }

  if (method === "POST") {
    const { title, description, price, images, category, properties } =
      req.body;
    const productDoc = await Product.create({
      title,
      description,
      price,
      images,
      category,
      properties,
    });
    return res.json(productDoc);
  }

  if (method === "PUT") {
    const { title, description, price, images, category, _id, properties } =
      req.body;
    const productDoc = await Product.updateOne(
      { _id },
      { title, description, price, images, category, properties }
    );
    console.log(productDoc);
    return res.json(productDoc);
  }

  if (method === "DELETE") {
    console.log("delete back");
    if (req.query?.id) {
      console.log("delete back with id");
      await Product.deleteOne({ _id: req.query.id });
      return res.json(true);
    }
  }
}
