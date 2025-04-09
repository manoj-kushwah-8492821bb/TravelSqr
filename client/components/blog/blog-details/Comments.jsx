import { useState, useEffect } from "react";
import { getRequestToken, requestToken } from "../../../api/Api";

const Comments = ({ blogId }) => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const apiEndpoint = `admin/blog/reviews/${blogId}`;
      const response = await getRequestToken(apiEndpoint, {}, "get", "");
      console.log("res route_:", response)
      setReviews(response.response || []);
      console.log("res reviews:", reviews)

    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (blogId) fetchReviews();
  }, [blogId]);

  return (
    <div className="row y-gap-40">
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <div key={index} className="col-12">
            <div className="row x-gap-20 y-gap-20 items-center">
              <div className="col-auto">
                <img src="/img/avatars/2.png" alt="User Avatar" />
              </div>
              <div className="col-auto">
                <div className="fw-500 lh-15">{review.email}</div>
                <div className="text-14 text-light-1 lh-15">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <p className="text-15 text-dark-1 mt-10">{review.review}</p>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
};

export default Comments;
