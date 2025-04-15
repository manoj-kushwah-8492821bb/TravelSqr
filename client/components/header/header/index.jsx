"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import MobileMenu from "../MobileMenu";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";
import { LoginSuccess } from "../../../features/LoginAuthSlice";
import { useRouter } from "next/router";
import { getRequestToken } from "../../../api/Api";
import { BASE_URL_IMG } from "../../../config";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { usePathname } from "next/navigation";

const Header1 = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  let items = useSelector((state) => state.userAuth);
  const [navbar, setNavbar] = useState(false);
  const [profile, setProfile] = useState("");
  const [nameFromLocalStorage, setNameFromLocalStorage] = useState(null);
  const [tokenFromLocalStorage, setTokenFromLocalStorage] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(!dropdownOpen);

  const services = [
    { name: "Flights", path: ["/", "/flight"] },
    { name: "Hotels", path: ["/hotels"] },
    { name: "Cabs Hire", path: ["/car-rental"] },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("name");
      setNameFromLocalStorage(name);
      const token = localStorage.getItem("token");
      setTokenFromLocalStorage(token);
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

  const logoutUser = () => {
    setCookie("userToken", undefined, 0);
    localStorage.removeItem("userToken");
    localStorage.removeItem("name");
    localStorage.removeItem("profile");
    if (router.pathname === "/") {
      router.reload();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
  }, []);

  const getData = async (name, token) => {
    const promiseToken = await getRequestToken(name, {}, "get", token);
    if (promiseToken.error) {
      if (promiseToken?.error?.response?.data?.ResponseCode === 401) {
        setCookie("userToken", undefined, 0);
        localStorage.removeItem("userToken");
        localStorage.removeItem("name");
        localStorage.removeItem("profile");
        router.push("/");
      } // }else{
      //   toast.error("Something went wrong. Please try again later.");
      // }
    } else {
      if (promiseToken.response.ResponseBody.status !== 1) {
        //toast.error("User inactive.");
        setCookie("userToken", undefined, 0);
        localStorage.removeItem("userToken");
        localStorage.removeItem("name");
        localStorage.removeItem("profile");
        router.push("/");
      } else {
        dispatch(LoginSuccess(promiseToken.response.ResponseBody.token));
        setProfile(promiseToken.response.ResponseBody.profile_pic);
      }
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        localStorage.getItem("userToken") !== null &&
        items.userDetails.token == ""
      ) {
        getData("user/auth", localStorage.getItem("userToken"));
      } else if (localStorage.getItem("token") !== null) {
        router.push("/admin/");
      }
      if (localStorage.getItem("profile") !== null) {
        setProfile(localStorage.getItem("profile"));
      }
    }
  }, []);

  return (
    <>
      <header className={`header bg-white ${navbar ? "is-sticky" : ""}`}>
        <div
          style={{ padding: "40px auto !important" }}
          className="container mx-auto"
        >
          <div className="row justify-between items-center">
            <div className="col-auto">
              <div className="d-flex items-center">
                <Link href="/" className="header-logo mr-5">
                  <img src="/img/general/TravelSqrLogo.png" alt="logo icon" />
                </Link>
              </div>
            </div>

            <div className="col-auto">
              <div className="d-flex items-center">
                {nameFromLocalStorage === null ? (
                  <div className="d-flex items-center ml-20 is-menu-opened-hide md:d-none">
                    {router.pathname !== "/user" && (
                      <Link
                        href="/user/"
                        className="button px-30 fw-400 text-14 border-dark-4 -blue-1 h-50 text-dark-4 ml-20"
                      >
                        Sign In
                      </Link>
                    )}
                    {router.pathname !== "/user/signup" && (
                      <Link
                        href="/user/signup"
                        className="button px-30 fw-400 text-14 border-dark-4 -blue-1 h-50 text-dark-4 ml-20"
                      >
                        Sign Up
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    {tokenFromLocalStorage === null && (
                      <div className="d-flex items-center ml-20 is-menu-opened-hide">
                        {nameFromLocalStorage}
                      </div>
                    )}
                    <div className="pl-15">
                      {" "}
                      {tokenFromLocalStorage === null && (
                        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                          <DropdownToggle nav>
                            {/* Use img tag for the avatar image */}
                            <img
                              src={`${BASE_URL_IMG}${profile}`}
                              alt="Avatar"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                              onError={(e) => {
                                e.target.src = "/img/profile.png";
                              }}
                            />
                          </DropdownToggle>
                          <DropdownMenu
                            style={{ border: "1px solid grey !important" }}
                          >
                            <DropdownItem
                              onClick={() => {
                                router.push("/user/db-settings");
                              }}
                            >
                              Profile Setting
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem onClick={logoutUser}>
                              Logout
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      )}
                    </div>
                  </>
                )}
                <div className="d-none xl:d-flex x-gap-20 items-center pl-30 text-dark-1">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* services list */}
          <div className="d-flex gap-2 mt-2">
            {services.map((tab) => {
              const isPathString = typeof path == "string";
              const isActive = isPathString
                ? pathname == tab.path
                : tab.path.includes(pathname);
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    router.push(isPathString ? tab.path : tab.path[0])
                  }
                  className="d-flex align-items-center gap-2 px-3 rounded-pill shadow-lg"
                  style={{
                    border: "none",
                    fontWeight: "500",
                    transition: "transform 0.3s",
                    backgroundColor: isActive ? "#051036" : "white",
                    border: "1px solid #051036",
                    color: isActive ? "white" : "#051036",
                  }}
                >
                  {tab.icon && <tab.icon size={20} />}
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header1;
