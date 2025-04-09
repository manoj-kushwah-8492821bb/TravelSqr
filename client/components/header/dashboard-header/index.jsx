"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import MobileMenu from "../MobileMenuAdmin";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";
import { LoginSuccess } from "../../../features/LoginAuthSlice";
import { useRouter } from "next/router";
import { requestToken } from "../../../api/Api";
import { BASE_URL_IMG } from "../../../config";

const Header1 = ({ style = "" }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  let items = useSelector((state) => state.userAuth);
  const [navbar, setNavbar] = useState(false);
  const [profile, setProfile] = useState("");
  const [nameFromLocalStorage, setNameFromLocalStorage] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("name");
      setNameFromLocalStorage(name);
    }
  }, []);

  const changeBackground = () => {
    if (window.scrollY >= 10) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  function setCookie(name, value, days) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const cookieValue =
      encodeURIComponent(value) +
      "; expires=" +
      expirationDate.toUTCString() +
      "; path=/";

    document.cookie = name + "=" + cookieValue;
  }

  const logout = () => {
    setCookie("token", undefined, 0);
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("profile");
    //router.push("/admin/");
    window.location.replace("/admin");
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
  }, []);

  const getData = async (name, token) => {
    const promiseToken = await requestToken(name, {}, "post", token);
    if (promiseToken.error) {
      if (promiseToken?.error?.response?.data?.ResponseCode === 401) {
        setCookie("token", undefined, 0);
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("profile");
        window.location.replace("/admin");
      } // }else{
      //   toast.error("Something went wrong. Please try again later.");
      // }
    } else {
      dispatch(LoginSuccess(promiseToken.response.ResponseBody.token));
      setProfile(promiseToken.response.ResponseBody.profile_pic);
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        localStorage.getItem("token") !== null &&
        items.userDetails.token == ""
      ) {
        //setProfile(localStorage.getItem("profile"));
        getData("admin/get", localStorage.getItem("token"));
      }
      if (localStorage.getItem("profile") !== null) {
        setProfile(localStorage.getItem("profile"));
      }
    }
  }, []);
  // useLayoutEffect(() => {
  //   if(typeof window !== "undefined"){

  //     if(localStorage.getItem("userToken") !== null && items.userDetails.token == ''){
  //       setProfile(localStorage.getItem("profile"));
  //       getData("user/auth",localStorage.getItem("userToken"));
  //     }
  //     if(localStorage.getItem("token") !== null && items.userDetails.token != ''){
  //       setProfile(localStorage.getItem("profile"));
  //       getData("admin/get",localStorage.getItem("token"));
  //     }

  //   }
  // }, []);

  return (
    <>
      <header className={`header bg-white ${navbar ? "is-sticky" : ""}`}>
        <div className="header__container px-30 sm:px-20">
          <div className="row justify-between items-center">
            <div className="col-auto">
              <div className="d-flex items-center">
                <Link href="/admin/db-dashboard" className="header-logo mr-50">
                  {/* <Image
                  src="/img/general/TravelSqrLogo.png"
                  alt="logo icon"
                  height={36}
                  width={140}
                /> */}
                  <img src="/img/general/Logo.png" alt="logo icon" />
                  {/* <img src="/img/general/Logo.png" alt="logo icon" />
                  <img src="/img/general/Logo.png" alt="logo icon" /> */}
                </Link>
                {/* End logo */}
              </div>
              {/* End d-flex */}
            </div>
            {/* End col */}
            <div className="col-auto">
              {/* <div className="header-menu">
                <div className="header-menu__content">
                  <nav className="menu js-navList">
                    <ul className={`menu__nav ${style} -is-active`}>
                      <li className={router.pathname === "/" ? "current" : ""}>
                        <Link href="/">Home</Link>
                      </li>
                      <li
                        className={
                          router.pathname === "/about" ? "current" : ""
                        }
                      >
                        <Link href="/about">About</Link>
                      </li>
                      <li
                        className={
                          router.pathname === "/destinations" ? "current" : ""
                        }
                      >
                        <Link href="/destinations">Destinations</Link>
                      </li>
                      <li
                        className={
                          router.pathname === "/help-center" ? "current" : ""
                        }
                      >
                        <Link href="/help-center">Help Center</Link>
                      </li>
                      <li
                        className={
                          router.pathname === "/contact" ? "current" : ""
                        }
                      >
                        <Link href="/contact">Contact</Link>
                      </li>
                      {typeof window !== "undefined" &&
                      localStorage.getItem("name") === null
                        ? null
                        : !router.asPath.includes("/user/") &&
                          !router.asPath.includes("/admin/") && (
                            <li
                              className={
                                router.pathname === "/user/db-dashboard"
                                  ? "current"
                                  : ""
                              }
                            >
                              <Link href="/user/db-dashboard">Dashboard</Link>
                            </li>
                          )}
                    </ul>
                  </nav>
                </div>
              </div> */}
            </div>
            {/* End header-menu */}

            <div className="col-auto">
              <div className="d-flex items-center">
                {/* End .row */}
                {nameFromLocalStorage !== null && (
                  <>
                    <div className="d-flex items-center ml-20 is-menu-opened-hide md:d-none">
                      <button
                        onClick={logout}
                        className="button px-30 fw-400 text-14 border-dark-4 -blue-1 h-50 text-dark-4 ml-20"
                      >
                        Logout
                      </button>
                    </div>
                    <div className="d-flex items-center ml-20 is-menu-opened-hide">
                      {nameFromLocalStorage}
                    </div>
                    <div
                      className="pl-15"
                      style={{
                        marginRight: "10px",
                        marginBottom: "0px !important",
                      }}
                    >
                      <img
                        width={50}
                        height={50}
                        src={`${BASE_URL_IMG}${profile}`}
                        alt="image"
                        className="size-50 rounded-22 object-cover"
                        onError={(e) => {
                          e.target.src = "/img/profile.png";
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Start mobile menu icon */}
                <div className="d-none xl:d-flex x-gap-20 items-center pl-30 text-dark-1">
                  {/* <div>
                    <Link
                      href="/user"
                      className="d-flex items-center icon-user text-inherit text-22"
                    />
                  </div> */}
                  <div>
                    <button
                      className="d-flex items-center icon-menu text-inherit text-20"
                      data-bs-toggle="offcanvas"
                      aria-controls="mobile-sidebar_menu"
                      data-bs-target="#mobile-sidebar_menu"
                    />

                    <div
                      className="offcanvas offcanvas-start  mobile_menu-contnet"
                      tabIndex="-1"
                      id="mobile-sidebar_menu"
                      aria-labelledby="offcanvasMenuLabel"
                      data-bs-scroll="true"
                    >
                      <MobileMenu />
                      {/* End MobileMenu */}
                    </div>
                  </div>
                </div>
                {/* End mobile menu icon */}
              </div>
            </div>
            {/* End col-auto */}
          </div>
          {/* End .row */}
        </div>
        {/* End header_container */}
      </header>
    </>
  );
};

export default Header1;
