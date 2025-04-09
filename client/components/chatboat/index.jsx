import { useState } from "react";
import { requestToken } from "../../api/Api";
import { toast } from "react-hot-toast";

const Chatboat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSentQuery, setIsSentQuery] = useState(false);
  const [Loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const promise = await requestToken(
        "user/submit-query",
        formData,
        "post",
        ""
      );

      if (promise.response.succeeded) {
        setIsSentQuery(true);
        toast.success("Query submitted successfully!");
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(promise.response.ResponseMessage);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting query:", error);
      toast.error("Something went wrong!");
    }
  };

  const toggleChatbox = () => {
    setIsChatOpen(!isChatOpen);
    setIsSentQuery(false);
    setLoading(false);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className="position-fixed rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: "50px",
          height: "50px",
          backgroundColor: "#5750F1",
          color: "#fff",
          bottom: "20px",
          right: "12px",
          border: "none",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
          cursor: "pointer",
        }}
        type="button"
        onClick={toggleChatbox}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
      </button>

      {/* Chatbox */}
      <div
        className={`position-fixed chatbox-container shadow-lg ${
          isChatOpen ? "open" : "closed"
        }`}
        style={{
          width: "350px",
          height: "450px",
          backgroundColor: "#fff",
          borderRadius: "15px",
          bottom: "80px",
          right: "18px",
          overflow: "hidden",
          border: "2px solid lightgray",
          zIndex: 999,
          transition: "transform 0.3s ease-in-out",
          transform: isChatOpen ? "scale(1)" : "scale(0)",
        }}
      >
        {/* Header */}
        <div
          className="d-flex bg-light align-items-center justify-content-between gap-2 p-3"
          style={{ fontWeight: "bold" }}
        >
          <img
            src="/img/general/TravelSqrLogo.png"
            alt="logo icon"
            width={110}
          />
          {/* <span style={{ fontSize: "14px" }}>Chat with Us</span> */}
          <button
            onClick={toggleChatbox}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Chat Content */}
        <div
          className="px-3 py-2"
          style={{ height: "100%", overflowY: "auto" }}
        >
          <p className="mb-3 text-muted fs-6">
            Enter your details below, and we’ll get back to you shortly.
          </p>

          {/* Form */}
          {isSentQuery || Loading ? (
            <div
              style={{ backgroundColor: "#5750F1", color: "#fff" }}
              className="p-2 rounded"
            >
              <p className="text-white">{formData?.name}</p>
              <p className="text-white">{formData?.phone}</p>
              <p className="text-white">{formData?.email}</p>
              <p className="text-white">{formData?.message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  border: "2px solid lightgray",
                }}
              />
              <input
                type="email"
                className="form-control mb-2"
                placeholder="Your Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  border: "2px solid lightgray",
                }}
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Your Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                  border: "2px solid lightgray",
                }}
              />
              <textarea
                className="form-control mb-2"
                placeholder="Your Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                style={{ height: "100px" }}
              />
              <button
                type="submit"
                className="btn w-100"
                style={{ backgroundColor: "#5750F1", color: "#fff" }}
              >
                Submit
              </button>
            </form>
          )}

          {!Loading && isSentQuery && (
            <div className="mt-2 bg-blue-2 p-3 rounded text-muted fs-6">
              <p>{formData?.phone}</p>
              <h3>Thank You!</h3>
              <p>One of our representatives will contact you shortly.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chatboat;
