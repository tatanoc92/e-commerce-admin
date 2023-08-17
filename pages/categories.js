import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import Link from "next/link";
import { withSwal } from "react-sweetalert2";

function Categories({ swal }) {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState("");
  const [editedCategory, setEditedCategory] = useState(null);
  const [properties, setProperties] = useState([]);

  async function saveCategory(ev) {
    ev.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put("/api/categories", data);
      setEditedCategory(null);
      setName("");
      setParentCategory("");
      setProperties([]);
      fetchCategories();
      return;
    } else {
      await axios.post("/api/categories", data);
      setName("");
      setParentCategory("");
      setProperties([]);
      fetchCategories();
    }
  }

  function fetchCategories() {
    axios.get("/api/categories").then((result) => setCategories(result.data));
  }

  function deleteCategory(category) {
    swal
      .fire({
        title: "Are you sure you want to delete this category?",
        text: "You won't be able to revert this!",
        icon: "warning",
        reverseButtons: true,
        confirmButtonColor: "#d55",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete("/api/categories?id=" + category._id);
          fetchCategories();
          swal.fire("Deleted!", "The category has been deleted.", "success");
        }
      });
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
  }

  function addProperty() {
    setProperties([...properties, { name: "", values: "" }]);
  }

  function handlePropertyNameChange(property, index, newName) {
    setProperties((prev) => {
      const newProperties = [...prev];
      newProperties[index].name = newName;
      return newProperties;
    });
  }

  function handlePropertyValuesChange(property, index, newValues) {
    setProperties((prev) => {
      const newProperties = [...prev];
      newProperties[index].values = newValues;
      return newProperties;
    });
  }

  function removeProperty(indexToRemove) {
    setProperties((prev) => {
      const newProperties = [...prev];
      return newProperties.filter((property, propertyIndex) => {
        return propertyIndex !== indexToRemove;
      });
    });
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : "Create new category"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          {" "}
          <input
            type="text"
            placeholder={"Category Name"}
            onChange={(ev) => setName(ev.target.value)}
            value={name}
          ></input>
          <select
            onChange={(e) => setParentCategory(e.target.value)}
            value={parentCategory}
          >
            <option value="">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block">Properties</label>
          <button
            type="button"
            onClick={addProperty}
            className="btn-default mb-2 texts-sm"
          >
            Add new property
          </button>
        </div>
        {properties.length > 0 &&
          properties.map((property, index) => (
            <div key={index} className="flex gap-1 mb-2">
              <input
                value={property.name}
                type="text"
                className="mb-0"
                placeholder="property name (example: colour)"
                onChange={(ev) =>
                  handlePropertyNameChange(property, index, ev.target.value)
                }
              />
              <input
                type="text"
                className="mb-0"
                value={property.values}
                onChange={(ev) =>
                  handlePropertyValuesChange(property, index, ev.target.value)
                }
                placeholder="values, comma separated"
              />
              <button
                type="button"
                onClick={() => removeProperty(index)}
                className="btn-red"
              >
                Remove
              </button>
            </div>
          ))}
        {editedCategory && (
          <button
            type="button"
            className="btn-default"
            onClick={() => {
              setEditedCategory(null);
              setName("");
              setParentCategory("");
              setProperties([]);
            }}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary py-1">
          Save
        </button>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Parent Category</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category.parent?.name || "No parent category"}</td>
                  <td>
                    <button
                      className="text-white px-4 rounded-md text-white text-sm py-1 px-2 rounded-md gap-1 mr-1 inline-flex bg-gray-700 text-sm py-1"
                      onClick={() => editCategory(category)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="btn-red text-white px-4 rounded-md text-white text-sm gap-1 mr-1 inline-flex text-sm py-1"
                      onClick={() => deleteCategory(category)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
