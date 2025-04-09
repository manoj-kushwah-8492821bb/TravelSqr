import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { isActiveLink } from "../../../utils/linkActiveChecker";
import {
  BsFillPersonVcardFill,
  BsSpeedometer,
  BsFileSpreadsheetFill,
  BsListStars,
  BsChatSquareTextFill,
  BsGearWideConnected,
  BsJournal,
  BsTag,
  BsChatSquare,
} from "react-icons/bs";
import { FaMapLocationDot, FaCircleQuestion, FaRegMessage, FaEnvelope  } from "react-icons/fa6";
import { BiSolidPlaneAlt } from "react-icons/bi";
import { BiSolidPlaneLand } from "react-icons/bi";

const Sidebar = () => {
  const router = useRouter();

  const sidebarContent = [
    {
      id: 1,
      name: " Dashboard",
      routePath: "/admin/db-dashboard",
    },
    {
      id: 2,
      name: " User Management",
      routePath: "/admin/users",
    },
    {
      id: 3,
      name: " Booking Management",
      routePath: "/admin/db-booking",
    },
    {
      id: 4,
      name: " Airport Management",
      routePath: "/admin/airports",
    },
    {
      id: 5,
      name: " Airline Management",
      routePath: "/admin/airlines",
    },
    {
      id: 6,
      name: " Content Management",
      routePath: "/admin/cms",
    },
    {
      id: 7,
      name: " Destination Management",
      routePath: "/admin/destinations",
    },
    {
      id: 8,
      name: " User Queries",
      routePath: "/admin/contact",
    },
    {
      id: 9,
      name: " Bulk Email",
      routePath: "/admin/email",
    },
    {
      id: 10,
      name: " Faqs",
      routePath: "/admin/faqs",
    },
    {
      id: 11,
      name: " Testimonial",
      routePath: "/admin/testimonial",
    },
    {
      id: 12,
      name: " Settings",
      routePath: "/admin/db-settings",
    },
    {
      id: 13,
      name: "Discount",
      routePath: "/admin/discount",
    },
    {
      id: 14,
      name: "Query",
      routePath: "/admin/query",
    },
    {
      id: 15,
      name: "Blog",
      routePath: "/admin/blog",
    },
    {
      id: 16,
      name: "Newsletter",
      routePath: "/admin/news",
    },
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
              {item.id === 1 ? (
                <BsSpeedometer />
              ) : item.id === 2 ? (
                <BsFillPersonVcardFill />
              ) : item.id === 3 ? (
                <BsFileSpreadsheetFill />
              ) : item.id === 4 ? (
                <BiSolidPlaneLand />
              ) : item.id === 5 ? (
                <BiSolidPlaneAlt />
              ) : item.id === 6 ? (
                <BsListStars />
              ) : item.id === 7 ? (
                <FaMapLocationDot />
              ) : item.id === 8 ? (
                <BsChatSquareTextFill />
              ) : item.id === 9 ? (
                <FaEnvelope />
              ) : item.id === 10 ? (
                <FaCircleQuestion />
              ) : item.id === 11 ? (
                <FaRegMessage  />
              ) : item.id === 12 ? (
                <BsGearWideConnected />
              ) : item.id === 13 ? (
                <BsTag />
              ) : item.id === 14 ? (
                <BsChatSquare />
              ) : item.id === 15 ? (
                <BsJournal />
              ) : item.id === 16 ? (
                <BsJournal />
              ) : null}
              &nbsp;{item.name}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
