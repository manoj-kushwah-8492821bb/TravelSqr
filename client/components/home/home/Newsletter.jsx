import { useState } from "react";
import { toast } from "react-hot-toast";
import { requestToken } from "../../../api/Api";

export default function NewsletterSection() {
  const [Loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSentQuery, setIsSentQuery] = useState(false); 

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const promise = await requestToken(
        "admin/submit-newsmail",
        { email },
        "post",
        ""
      );
      if (promise.response.succeeded) {
        setIsSentQuery(true);
        setEmail("");
        toast.success("Newsletter subscribed successfully!");
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(promise.response.ResponseMessage);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error saving news");
    }
  };
  return (
    <div className="newsletter-container layout-pt-md layout-pb-md">
      <div className="container">
        <div className="newsletter-box">
          <h2 className="newsletter-title">
            Subscribe Newsletter &<br /> Get Latest News
          </h2>
          <div className="newsletter-input-group">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              className="newsletter-input"
            />
            <button onClick={handleSubmit} className="newsletter-button">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
