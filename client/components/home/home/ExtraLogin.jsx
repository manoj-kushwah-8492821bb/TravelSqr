import Link from "next/link";
import React, { useEffect, useState } from "react";

const ExtraLogin = () => {
  const [nameFromLocalStorage, setNameFromLocalStorage] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("name");
      setNameFromLocalStorage(name);
    }
  }, []);
  return (
    !nameFromLocalStorage && (
      <div className="container extra-login layout-pt-md">
        <div className="extra-login-text mb-20">
          <h2>Your account, your travel</h2>
        </div>
        <div className="extra-login-box">
          <div className="extra-login-text">
            {/* <h2>Your account, your travel</h2> */}
            <p className="bold-text text-20">
              All your trip details in one place
            </p>
            <p className="sub-text">
              Sign in to book faster and manage your trip with ease
            </p>

            <div className="d-flex mt-30 items-center">
              <Link
                href="/user/"
                className="button px-20 fw-400 text-14 border-dark-4 -blue-1 h-40 text-dark-4"
              >
                Sign In
              </Link>
              <Link
                href="/user/signup"
                className="button px-20 fw-400 text-14 border-dark-4 -blue-1 h-40 text-dark-4 ml-20"
              >
                Sign Up
              </Link>
            </div>
          </div>
          <div className="extra-login-image">
            <img src="/img/masthead/1/GeniusGenericGiftBox.png" alt="Genius" />
          </div>
        </div>
      </div>
    )
  );
};

export default ExtraLogin;
