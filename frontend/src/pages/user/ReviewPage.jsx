// frontend/src/pages/user/ReviewPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/layout/navbar";
import Footer from "../../components/layout/footer";
import { Star, ArrowLeft, Loader2 } from "lucide-react";

export default function ReviewPage() {
  const { id } = useParams(); // orderId
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch order to display summary / validate
  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/Login");

      const res = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(res.data);
    } catch (error) {
      console.log("Error:", error);
      navigate("/transactions");
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (rating === 0) return alert("Please select a star rating.");

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/reviews",
        {
          orderId: id,
          productId: order.items[0].productId._id, // If 1 product per order
          rating,
          comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Review submitted successfully!");
      navigate("/transactions");
    } catch (error) {
      console.log(error);
      alert("Something went wrong while submitting your review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader2 size={40} className="animate-spin text-pink-600" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">Write a Review</h1>
        <p className="text-gray-600 mb-6">
          Share your experience with this product.
        </p>

        {/* Product Summary */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 mb-8 flex gap-4">
          <img
            src={order.items[0].productId.images[0].url}
            className="w-24 h-24 object-cover rounded-lg"
            alt="product"
          />

          <div>
            <h2 className="text-xl font-semibold">{order.items[0].productId.name}</h2>
            <p className="text-gray-600">{order.items[0].productId.category}</p>
            <p className="mt-2 text-pink-600 font-semibold">
              ₱{order.items[0].price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Star Rating */}
        <h3 className="text-lg font-semibold mb-2">Your Rating</h3>
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={34}
              className={`cursor-pointer transition ${
                (hoverRating || rating) >= star
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        {/* Comment */}
        <h3 className="text-lg font-semibold mb-2">Your Review</h3>
        <textarea
          rows="5"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe your experience..."
          className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 mb-6"
        ></textarea>

        {/* Submit Button */}
        <button
          disabled={submitting}
          onClick={submitReview}
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            submitting ? "bg-gray-400" : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>

      <Footer />
    </div>
  );
}
