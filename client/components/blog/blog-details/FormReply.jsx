import { useState } from "react";
import { requestToken } from "../../../api/Api";
import toast from "react-hot-toast";

const FormReply = ({ blogId }) => {
  const [email, setEmail] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Prevent page reload

    if (!email || !review) {
      setErrorMessage("Both email and review are required.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("blogId", blogId);
      formData.append("email", email);
      formData.append("review", review);

      const apiEndpoint = "admin/blog/addreview";
      const result = await requestToken(apiEndpoint, formData, "post", "");

      if (result.response?.succeeded) {
        toast.success("Your review has been submitted successfully!");
        setEmail("");
        setReview("");
      } else {
        toast.error("Failed to submit review. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="row y-gap-30 pt-40" onSubmit={handleSubmit}>
      {/* Email Input */}
      <div className="col-xl-6">
        <div className="form-input">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="lh-1 text-16 text-light-1">Email</label>
        </div>
      </div>

      {/* Review Input */}
      <div className="col-12">
        <div className="form-input">
          <textarea
            required
            rows={6}
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <label className="lh-1 text-16 text-light-1">Write Your Comment</label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="col-auto">
        <button
          type="submit"
          className="button -md -dark-1 bg-blue-1 text-white"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Post Comment"}
          <div className="icon-arrow-top-right ml-15" />
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && <p className="text-success">{successMessage}</p>}
      {errorMessage && <p className="text-danger">{errorMessage}</p>}
    </form>
  );
};

export default FormReply;
