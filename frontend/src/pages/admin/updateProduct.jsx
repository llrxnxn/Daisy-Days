import React, { useState, useEffect } from "react";
import { Upload, Save, Loader, ArrowLeft, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function UpdateProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch existing product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const product = res.data;

        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
        });

        // ✅ Store full image objects with url and publicId
        setExistingImages(product.images || []);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        alert("Error loading product.");
        navigate("/AdminDashboard", { state: { openTab: "products" } });
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Handle Input Change
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle New Image Upload
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
      file,
    }));

    setSelectedImages((prev) => [...prev, ...previews]);
    setImageFiles((prev) => [...prev, ...validFiles]);
  };

  // Remove selected new image
  const removeNewImage = (id) => {
    const img = selectedImages.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.url);

    setSelectedImages((prev) => prev.filter((i) => i.id !== id));
    setImageFiles((prev) => prev.filter((f) => f !== img.file));
  };

  // ✅ Remove existing image by publicId
  const removeExistingImage = (publicId) => {
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const submitForm = new FormData();
      submitForm.append("name", formData.name);
      submitForm.append("description", formData.description);
      submitForm.append("price", Number(formData.price));
      submitForm.append("stock", Number(formData.stock));
      submitForm.append("category", formData.category);

      // ✅ Send existing images as a single JSON string
      submitForm.append("existingImages", JSON.stringify(existingImages));

      // ✅ Add new images
      imageFiles.forEach((file) => submitForm.append("images", file));

      await api.put(`/products/${id}`, submitForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product updated successfully!");
      navigate("/AdminDashboard", { state: { openTab: "products" } });
    } catch (err) {
      console.error(err);
      alert("Error updating product.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader size={40} className="animate-spin text-purple-600" />
      </div>
    );
  }

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

        <h1 className="text-3xl font-bold text-gray-800">Update Product</h1>
        <p className="text-gray-500">Edit the product information below.</p>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-semibold text-gray-700">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
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
              value={formData.description}
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
                value={formData.price}
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
                value={formData.stock}
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
              value={formData.category}
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

          {/* Images */}
          <div>
            <label className="font-semibold text-gray-700">Product Images</label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-3">
                {existingImages.map((img) => (
                  <div key={img.publicId} className="relative">
                    <img
                      src={img.url}
                      className="w-full h-24 object-cover rounded-xl"
                      alt="Product"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.publicId)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload New Images */}
            <label className="border-2 border-dashed rounded-xl p-6 flex items-center justify-center gap-2 text-gray-500 cursor-pointer">
              <Upload size={20} />
              Upload New Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Preview New Images */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-3">
                {selectedImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.url}
                      className="w-full h-24 object-cover rounded-xl"
                      alt="New upload"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(img.id)}
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
                Updating...
              </>
            ) : (
              <>
                <Save size={20} />
                Update Product
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}