import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { isActiveLink } from "../../../utils/linkActiveChecker";
import { BsSpeedometer , BsFileSpreadsheetFill, BsGearWideConnected } from 'react-icons/bs';

const Sidebar = () => {
  const router = useRouter();

  const sidebarContent = [
    {
      id: 1,
      name: "Dashboard",
      routePath: "/user/db-dashboard",
    },
    // {
    //   id: 2,
    //   icon: "/img/dashboard/sidebar/booking.svg",
    //   name: " Dashboard",
    //   routePath: "/user/db-dashboard",
    // },
    {
      id: 2,
      name: " Booking Management",
      routePath: "/user/db-booking",
    },
    {
      id: 3,
      name: " Settings",
      routePath: "/user/db-settings",
    },
    // {
    //   id: 4,
    //   icon: "/img/dashboard/sidebar/booking.svg",
    //   name: " Airport Management",
    //   routePath: "/admin/airports",
    // },
    // {
    //   id: 5,
    //   icon: "/img/dashboard/sidebar/booking.svg",
    //   name: " Airlines Management",
    //   routePath: "/admin/airlines",
    // },
    // {
    //   id: 6,
    //   icon: "/img/dashboard/sidebar/bookmark.svg",
    //   name: " Content Management",
    //   routePath: "/admin/cms",
    // },
    // {
    //   id: 7,
    //   icon: "/img/dashboard/sidebar/log-out.svg",
    //   name: " Logout",
    //   routePath: "/others-pages/login",
    // },
  ];
  return (
    <div className="sidebar -dashboard">
      {sidebarContent.map((item) => (
        <div className="sidebar__item" key={item.id}>
          <div
            className={`${
              isActiveLink(item.routePath, router.asPath) ? "-is-active" : ""
            } sidebar__button `}
          >
            <Link
              href={item.routePath}
              className="d-flex items-center text-15 lh-1 fw-500"
            >
              {/* <Image
                width={20}
                height={20}
                src={item.icon}
                alt="image"
                className="mr-15"
              /> */}
              {item.id===1?<BsSpeedometer  />:
              item.id===2?<BsFileSpreadsheetFill />:
              item.id===3?<BsGearWideConnected />:null}
              &nbsp;{item.name}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
