import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: assignedProperties,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [price, setPrice] = useState(existingPrice || "");
  const [goToProducts, setGoToProducts] = useState(false);
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );
  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  useEffect(() => {
    setTitle(existingTitle || "");
    setDescription(existingDescription || "");
    setPrice(existingPrice || "");
    setImages(existingImages || []);
    setCategory(existingCategory || "");
  }, [
    existingCategory,
    existingTitle,
    existingDescription,
    existingPrice,
    existingImages,
  ]);

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,
      properties: productProperties,
    };
    console.log(data);
    if (_id) {
      await axios.put("/api/products", { ...data, _id });
      setGoToProducts(true);
    } else {
      await axios.post("/api/products", data);
      setGoToProducts(true);
    }
  }

  if (goToProducts) {
    router.push("/products");
  }

  async function uploadImages(ev) {
    setIsUploading(true);
    const files = ev.target?.files;
    if (files?.length > 0) {
      console.log("uploading picture");
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      const res = await axios.post("/api/upload", data);
      setImages((oldImages) => {
        return [...oldImages, ...res.data.links];
      });
    }
    setIsUploading(false);
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  //Review below code

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?.id) {
      const parentCat = categories.find(
        ({ _id }) => _id === catInfo?.parent?._id
      );
      propertiesToFill.push(parentCat.properties);
      catInfo = parentCat;
    }
  }

  return (
    <form onSubmit={saveProduct}>
      <label> Product Name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      ></input>
      <label>Category</label>
      <select value={category} onChange={(ev) => setCategory(ev.target.value)}>
        <option value="">Uncategorized</option>
        {categories.length > 0 &&
          categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
      </select>
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div className="gap-1 text-sm">
            <div>{p.name[0].toUpperCase() + p.name.substring(1)}</div>
            <select
              value={productProperties[p.name]}
              onChange={(ev) => setProductProp(p.name, ev.target.value)}
            >
              {p.values.map((v) => (
                <option value={v}>{v}</option>
              ))}
            </select>
          </div>
        ))}
      <label>Photos</label>
      <div className="flex flex-wrap gap-1 mb-2">
        <ReactSortable
          className="flex flex-wrap gap-1"
          list={images}
          setList={updateImagesOrder}
        >
          {!!images?.length &&
            images.map((link) => (
              <div
                className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
                key={link}
              >
                <img className="rounded-lg" src={link} alt="product image" />
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}

        <label className="cursor-pointer w-24 h-24 text-sm gap-1 text-primary rounded-sm flex bg-white flex-col items-center justify-center shadow-sm border border-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15"
            />
          </svg>
          <div>Add image</div>
          <input type="file" onChange={uploadImages} className="hidden"></input>
        </label>
      </div>
      <label> Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(ev) => setDescription(ev.target.value)}
      ></textarea>
      <label> Price (in USD)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(ev) => setPrice(ev.target.value)}
      />
      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
}
