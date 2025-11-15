import React, { useState } from "react";
import { Upload, Plus, Loader, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    images: []
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Handle Input Fields
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const submitForm = new FormData();
      submitForm.append("name", formData.name);
      submitForm.append("description", formData.description);
      submitForm.append("price", formData.price);
      submitForm.append("stock", formData.stock);
      submitForm.append("category", formData.category);

      imageFiles.forEach((file) => {
        submitForm.append("images", file);
      });

      const res = await api.post("/products", submitForm, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Product added successfully!");
      navigate('/AdminDashboard', { state: { openTab: 'products' } });

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
        onClick={() => navigate('/AdminDashboard', { state: { openTab: 'products' } })}
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
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="font-semibold text-gray-700">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              onChange={handleInput}
              className="w-full mt-1 p-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Description *</label>
            <textarea
              name="description"
              required
              rows="3"
              onChange={handleInput}
              className="w-full mt-1 p-3 border rounded-xl"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700">Price (₱) *</label>
              <input
                type="number"
                name="price"
                required
                onChange={handleInput}
                className="w-full mt-1 p-3 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700">Stock *</label>
              <input
                type="number"
                name="stock"
                required
                onChange={handleInput}
                className="w-full mt-1 p-3 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700">Category *</label>
            <select
              name="category"
              required
              onChange={handleInput}
              className="w-full mt-1 p-3 border rounded-xl"
            >
              <option value="">Select</option>
              <option value="Birthday">Birthday</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Romance">Romance</option>
              <option value="Holiday">Holiday</option>
              <option value="Get Well">Get Well</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="font-semibold text-gray-700">Product Images</label>

            <label className="border-2 border-dashed rounded-xl p-6 flex items-center justify-center gap-2 text-gray-500 cursor-pointer">
              <Upload size={20} />
              Upload Images
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-3">
                {selectedImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img src={img.url} className="w-full h-24 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 flex items-center justify-center gap-2"
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
