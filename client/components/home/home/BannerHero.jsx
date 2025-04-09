import React from "react";
import { useRouter } from "next/router";

const BannerHero = () => {
  const router = useRouter();
  return (
    <div className="container layout-pt-md">
      <div className="bannerhero ">
        <div className="bannerhero-content">
          <h2 className="bannerhero-title">
            Fly Smart, Save Big with{" "}
            <span className="bannerhero-highlight">Travel Square</span>
          </h2>
          <p className="bannerhero-text">
            Get Up to $100 Off On Your First Booking with Travel Square!
          </p>
          <button
            onClick={() => router.push("/flight")}
            className="bannerhero-button"
          >
            Book Now
            <div className="icon-arrow-top-right" />
          </button>
        </div>

        <div className="bannerhero-image">
          <img
            src="/img/masthead/1/1.png"
            alt="Emirates Plane"
            className="bannerhero-img"
          />
        </div>
      </div>
    </div>
  );
};

export default BannerHero;
