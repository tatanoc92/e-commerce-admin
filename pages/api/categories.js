import { Category } from "@/models/Category";
import mongoose from "mongoose";
import { mongooseConnect } from "../../lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRequest } from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "POST") {
    try {
      let { name, parentCategory, properties } = req.body;

      if (parentCategory === "") {
        parentCategory = null;
      }

      const categoryDoc = await Category.create({
        name,
        parent: parentCategory || undefined,
        properties,
      });
      console.log("Category document created:", categoryDoc);
      return res.json(categoryDoc);
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({ error: "Failed to create category" });
    }
  }

  if (method === "GET") {
    try {
      if (req.query?.id) {
        const categoryDoc = await Category?.findOne({ _id: req.query.id });
        res.json(categoryDoc);
      } else {
        const categoryDocs = await Category?.find().populate("parent");
        res.json(categoryDocs);
      }
    } catch (error) {
      console.error("Error retrieving categories:", error);
      res.status(500).json({ error: "Failed to retrieve categories" });
    }
  }

  if (method === "PUT") {
    const { name, parentCategory, _id, properties } = req.body;
    const categoryDoc = await Category?.updateOne(
      { _id },
      {
        name,
        parent: parentCategory || undefined,
        properties,
      }
    );
    res.json(categoryDoc);
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      await Category?.deleteOne({ _id: req.query.id });
      return res.json(true);
    }
  }
}
