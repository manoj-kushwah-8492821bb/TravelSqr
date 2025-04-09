import Seo from "../../../components/common/Seo";
import Sidebar from "../common/Sidebar";
import Header from "../../../components/header/header";
import SettingsTabs from "./components/index";
import Footer from "../common/Footer";

const index = () => {
  return (
    <>
      <Seo pageTitle="Settings" />
      {/* End Page Title */}

      <div className="header-margin"></div>

      <Header />
      {/* End dashboard-header */}

      {/* <div className="dashboard"> */}
      <div className="">
        {/* <div className="dashboard__sidebar bg-white scroll-bar-1">
          <Sidebar />
        </div> */}
        {/* End dashboard__sidebar */}

        {/* <div className="dashboard__main"> */}
        <div className="">
          <div className="dashboard__content pb-60 bg-light-2">
            <div className="container mx-auto">
              <SettingsTabs />
            </div>
          </div>

          <Footer />
        </div>
        {/* End .dashboard__content */}
      </div>
      {/* End dashbaord content */}
    </>
  );
};

export default index;
