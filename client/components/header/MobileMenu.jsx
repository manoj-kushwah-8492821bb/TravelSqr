"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ProSidebarProvider, Sidebar, Menu, MenuItem } from "react-pro-sidebar";

const MobileMenu = () => {
  const router = useRouter();
  const [nameFromLocalStorage, setNameFromLocalStorage] = useState(null);
  const [tokenFromLocalStorage, setTokenFromLocalStorage] = useState(null);
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
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("name");
      setNameFromLocalStorage(name);
      const token = localStorage.getItem("token");
      setTokenFromLocalStorage(token);
    }
  }, []);

  return (
    <>
      <div className="pro-header d-flex align-items-center justify-between border-bottom-light">
        <Link href="/" className="header-logo mr-50">
          <img src="/img/general/TravelSqrLogo.png" alt="logo icon" />
        </Link>
        <div
          className="fix-icon"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        >
          <i className="icon icon-close"></i>
        </div>
      </div>

      <ProSidebarProvider>
        <Sidebar width="400" backgroundColor="#fff">
          <Menu>
            {nameFromLocalStorage === null ? (
              <>
                {router.pathname !== "/user" && (
                  <MenuItem
                    component={
                      <Link
                        href="/user/"
                        className={
                          router.pathname === "/user" ? "menu-active-link" : ""
                        }
                      />
                    }
                  >
                    Sign In
                  </MenuItem>
                )}
                {router.pathname !== "/user/signup" && (
                  <MenuItem
                    component={
                      <Link
                        href="/user/signup"
                        className={
                          router.pathname === "/user/signup"
                            ? "menu-active-link"
                            : ""
                        }
                      />
                    }
                  >
                    Sign Up
                  </MenuItem>
                )}
              </>
            ) : (
              <button
                onClick={logoutUser}
                className="button px-30 fw-400 text-14 border-dark-4 -blue-1 h-50 text-dark-4 ml-20"
              >
                Logout
              </button>
            )}
          </Menu>
        </Sidebar>
      </ProSidebarProvider>
      {/* End pro-footer */}
    </>
  );
};

export default MobileMenu;
