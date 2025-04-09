import React from "react";
import Faq from "../../components/faq/Faq";
import Seo from "../../components/common/Seo";
import Header1 from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ExtraLogin from "../../components/home/home/ExtraLogin";
import NewsletterSection from "../../components/home/home/Newsletter";
import MainFilterSearchBox from "../../components/activity-list/activity-list-v1/MainFilterSearchBox";
import HotelProperties from "../../components/hotel-list/hotel-list-v1/HotelProperties";
import Sidebar from "../../components/hotel-list/hotel-list-v1/Sidebar";
import TopHeaderFilter from "../../components/hotel-list/hotel-list-v1/TopHeaderFilter";
import dynamic from "next/dynamic";

const Hotels = () => {
  return (
    <div>
      <Seo pageTitle="Hotels Booking" />
      <Header1 />
      <div className="header-margin"></div>

      {/* hero section with searchbar */}
      <section className="py-90" style={{ backgroundColor: "#2a50bf" }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              {/* Title and sub title */}
              <div className="text">
                <h1
                  className="text-60 lg:text-40 md:text-30 text-white"
                  data-aos="fade-up"
                >
                  Live the dream in a holiday home
                </h1>
                <p
                  className="text-white mt-6 md:mt-10"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  Choose from houses, villas, chalets and more
                </p>
              </div>
              <MainFilterSearchBox />
            </div>
          </div>
        </div>
      </section>

      {/* hotels list */}
      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row y-gap-30">
            <div className="col-xl-3">
              <aside className="sidebar y-gap-40 xl:d-none">
                <Sidebar />
              </aside>
              {/* End sidebar for desktop */}

              <div
                className="offcanvas offcanvas-start"
                tabIndex="-1"
                id="listingSidebar"
              >
                <div className="offcanvas-header">
                  <h5 className="offcanvas-title" id="offcanvasLabel">
                    Filter Rentals
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  ></button>
                </div>
                {/* End offcanvas header */}

                <div className="offcanvas-body">
                  <aside className="sidebar y-gap-40  xl:d-block">
                    <Sidebar />
                  </aside>
                </div>
                {/* End offcanvas body */}
              </div>
              {/* End mobile menu sidebar */}
            </div>
            {/* End col */}

            <div className="col-xl-9 ">
              <TopHeaderFilter />
              <div className="mt-30"></div>
              {/* End mt--30 */}
              <div className="row y-gap-30">
                <HotelProperties />
              </div>
              {/* End .row */}
            </div>
            {/* End .col for right content */}
          </div>
          {/* End .row */}
        </div>
        {/* End .container */}
      </section>

      <ExtraLogin />
      <Faq />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default dynamic(() => Promise.resolve(Hotels), { ssr: false });
