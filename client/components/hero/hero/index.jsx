import { useState } from "react";
import Loader from "../../../pages/flight/Loader";
import MainFilterSearchBox from "./MainFilterSearchBox";
import { useSelector, useDispatch } from "react-redux";

const Index = () => {
  const { tabs, currentTab } = useSelector((state) => state.hero);
  const dispatch = useDispatch();
  const [flagStatus, setFlagStatus] = useState(0);

  const flag = (val) => setFlagStatus(val);
  const loadingStatus = () => setFlagStatus(0);

  // Determine header and description text based on the selected tab
  const tabDetails = {
    Flights: {
      header: "Find Your Next Flight",
      description: "Get the best flight deals and offers",
    },
    Hotel: {
      header: "Find the right hotel today",
      description: "Discover the best hotels for your stay",
    },
    Cab: {
      header: "Find the best cab service",
      description: "Quick and easy cab bookings at your service",
    },
  };

  const { header, description } =
    tabDetails[currentTab] || tabDetails["Flights"];

  return (
    <section
      className="-type-1 z-5"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5)), url("${
          tabs.find((tab) => tab.name === currentTab)?.bgImage
        }")`,
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        paddingTop: "200px",
        backgroundColor: "rgb(0,0,0,0.1)",
        paddingBottom: "130px",
      }}
    >
      {flagStatus !== 0 ? (
        <div className="container">
          <div className="row">
            <div className="col">
              <Loader />
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
          <div>
            <div className="col-auto">
              <div className="text">
                <h1
                  className="text-60 lg:text-40 md:text-30 text-white"
                  data-aos="fade-up"
                >
                  {header}
                </h1>
                <p
                  className="text-white mt-6 md:mt-10"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  {description}
                </p>
              </div>

              {/* Main Filter Search Box */}
              <div
                className="tabs -underline mt-20 js-tabs rounded"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <MainFilterSearchBox
                  flag={flag}
                  loadingStatus={loadingStatus}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Index;
