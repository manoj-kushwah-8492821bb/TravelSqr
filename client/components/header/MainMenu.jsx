import Link from "next/link";

import {
  homeItems,
  blogItems,
  pageItems,
  dashboardItems,
} from "../../data/mainMenuData";
import CategoriesMegaMenu from "./CategoriesMegaMenu";
import {
  isActiveParent,
  isActiveLink,
  isActiveParentChaild,
} from "../../utils/linkActiveChecker";
import { useRouter } from "next/router";

const MainMenu = ({ style = "" }) => {
  const router = useRouter();

  return (
    <nav className="menu js-navList">
      <ul className={`menu__nav ${style} -is-active`}>
        <li className={router.pathname === "/" ? "current" : ""}>
          <Link href="/">Home</Link>
        </li>
        <li className={router.pathname === "/about" ? "current" : ""}>
          <Link href="/about">About</Link>
        </li>
        <li className={router.pathname === "/destinations" ? "current" : ""}>
          <Link href="/destinations">Destinations</Link>
        </li>
        <li className={router.pathname === "/help-center" ? "current" : ""}>
          <Link href="/help-center">Help Center</Link>
        </li>
        <li className={router.pathname === "/contact" ? "current" : ""}>
          <Link href="/contact">Contact</Link>
        </li>
        {/* {typeof window !== 'undefined' && localStorage.getItem('name') !== null &&
        <li className={router.pathname === "/help-center" ? "current" : ""}>
          <Link href="/user/db-dashboard">Dashboard</Link>
        </li>} */}
      </ul>
    </nav>
  );
};

export default MainMenu;
