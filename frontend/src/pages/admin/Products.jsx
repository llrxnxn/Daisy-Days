import React, { useState } from "react";
import { Upload, Plus, Loader, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../api/axios";

// Yup Validation Schema
const productSchema = yup.object({
  name: yup
    .string()
    .min(3, "Product name must be at least 3 characters")
    .required("Product name is required"),
  description: yup
    .string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be greater than 0")
    .required("Price is required"),
  stock: yup
    .number()
    .typeError("Stock must be a number")
    .positive("Stock must be greater than 0")
    .integer("Stock must be a whole number")
    .required("Stock is required"),
  category: yup
    .string()
    .required("Category is required")
});

export default function AddProduct() {
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange"
  });

  // Handle Image Upload Preview
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB).`);
        return false;
      }
      return true;
    });

    const previews = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file
    }));

    setSelectedImages([...selectedImages, ...previews]);
    setImageFiles([...imageFiles, ...validFiles]);
  };

  const removeImage = (id) => {
    const img = selectedImages.find((i) => i.id === id);
    setSelectedImages(selectedImages.filter((i) => i.id !== id));

    if (img) URL.revokeObjectURL(img.url);

    setImageFiles(imageFiles.filter((file) => file !== img.file));
  };

  // Submit Form
  const onSubmit = async (data) => {
    if (imageFiles.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setIsUploading(true);

    try {
      const submitForm = new FormData();
      submitForm.append("name", data.name);
      submitForm.append("description", data.description);
      submitForm.append("price", data.price);
      submitForm.append("stock", data.stock);
      submitForm.append("category", data.category);

      imageFiles.forEach((file) => {
        submitForm.append("images", file);
      });

      const res = await api.post("/products", submitForm, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Product added successfully!");
      navigate("/AdminDashboard", { state: { openTab: "products" } });
    } catch (err) {
      console.error(err);
      alert("Error adding product.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <button
          onClick={() =>
            navigate("/AdminDashboard", { state: { openTab: "products" } })
          }
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
        <p className="text-gray-500">Fill out the form to store a new product.</p>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="font-semibold text-gray-700">Product Name *</label>
            <input
              type="text"
              placeholder="Enter product name"
              {...register("name")}
              className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-gray-700">Description *</label>
            <textarea
              placeholder="Enter product description"
              rows="3"
              {...register("description")}
              className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700">Price (₱) *</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                {...register("price")}
                className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-gray-700">Stock *</label>
              <input
                type="number"
                placeholder="0"
                {...register("stock")}
                className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.stock ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="font-semibold text-gray-700">Category *</label>
            <select
              {...register("category")}
              className={`w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Category</option>
              <option value="Birthday">Birthday</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Romance">Romance</option>
              <option value="Holiday">Holiday</option>
              <option value="Get Well">Get Well</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="font-semibold text-gray-700">Product Images</label>

            <label className="border-2 border-dashed border-purple-300 rounded-xl p-6 flex items-center justify-center gap-2 text-gray-500 cursor-pointer hover:bg-purple-50 transition">
              <Upload size={20} />
              Upload Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {selectedImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt="preview"
                      className="w-full h-24 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {selectedImages.length} image(s) uploaded
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
          >
            {isUploading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus size={20} />
                Add Product
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}