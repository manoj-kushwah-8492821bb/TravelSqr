"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ProSidebarProvider,
  Sidebar,
  Menu,
  MenuItem,
} from "react-pro-sidebar";

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
  const logout = () => {
    setCookie("token", undefined, 0);
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("profile");
    router.push("/admin/");
  };
  useEffect(() => {
    if(typeof window !== 'undefined'){  
      const name = localStorage.getItem("name");
      setNameFromLocalStorage(name);
    }
  }, []);

  return (
    <>
      <div className="pro-header d-flex align-items-center justify-between border-bottom-light">
        <Link href="/">
          <img src="/img/general/logo-white.svg" alt="brand" />
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
            {nameFromLocalStorage !== null &&
              <>
                <MenuItem
                  component={
                    <Link
                      href="/admin/db-dashboard"
                      className={
                        router.pathname === "/admin/db-dashboard"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  Dashboard
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      href="/admin/users"
                      className={
                        router.pathname === "/admin/users"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  User Management
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      href="/admin/db-booking"
                      className={
                        router.pathname === "/admin/db-booking"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  Booking Management
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      href="/admin/airports"
                      className={
                        router.pathname === "/admin/airports"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  Airport Management
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      href="/admin/airlines"
                      className={
                        router.pathname === "/admin/airlines"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  Airline Management
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      href="/admin/cms"
                      className={
                        router.pathname === "/admin/cms"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  Content Management
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      href="/admin/destinations"
                      className={
                        router.pathname === "/admin/destinations"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  Destination Management
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      href="/admin/contact"
                      className={
                        router.pathname === "/admin/contact"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  User Query
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      href="/admin/faqs"
                      className={
                        router.pathname === "/admin/faqs"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  FAQ
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      href="/admin/testimonial"
                      className={
                        router.pathname === "/admin/testimonial"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  Testimonial
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      href="/admin/db-settings"
                      className={
                        router.pathname === "/admin/db-settings"
                          ? "menu-active-link"
                          : ""
                      }
                    />
                  }
                >
                  Settings
                </MenuItem>
              </>
            }
          </Menu>
        </Sidebar>
      </ProSidebarProvider>

      <div className="mobile-footer px-20 py-5 border-top-light"></div>

      <ProSidebarProvider>
        <Sidebar width="400" backgroundColor="#fff">
          <Menu>
          {nameFromLocalStorage !== null &&
            <button
              onClick={logout}
              className="button px-30 fw-400 text-14 border-dark-4 -blue-1 h-50 text-dark-4 ml-20"
            >
              Logout
            </button>
          }
          </Menu>
        </Sidebar>
      </ProSidebarProvider>
      {/* End pro-footer */}
    </>
  );
};

export default MobileMenu;
