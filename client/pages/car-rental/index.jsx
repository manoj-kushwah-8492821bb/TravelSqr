import React from "react";
import Faq from "../../components/faq/Faq";
import Seo from "../../components/common/Seo";
import Header1 from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ExtraLogin from "../../components/home/home/ExtraLogin";
import NewsletterSection from "../../components/home/home/Newsletter";
import MainFilterSearchBox from "../../components/car-list/car-list-v1/MainFilterSearchBox";
import Sidebar from "../../components/car-list/car-list-v1/Sidebar";
import CarPropertes from "../../components/car-list/car-list-v1/CarPropertes";
import TopHeaderFilter from "../../components/car-list/car-list-v1/TopHeaderFilter";
import dynamic from "next/dynamic";

const Cabs = () => {
  return (
    <>
      <Seo pageTitle="Cabs Booking" />
      <Header1 />
      <div className="header-margin"></div>

      {/* hero section */}
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
                  Car Rental for any kind of trip
                </h1>
                <p
                  className="text-white mt-6 md:mt-10"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  Great cars at great prices, from the biggest car rental
                  companies
                </p>
              </div>

              <MainFilterSearchBox />
            </div>
          </div>
        </div>
      </section>

      {/* cabs list */}
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
                    Filter Hotels
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
              <div className="row y-gap-30">
                <CarPropertes />
              </div>
            </div>
          </div>
        </div>
      </section>
      <ExtraLogin />
      <Faq />
      <NewsletterSection />
      <Footer />
    </>
  );
};

export default dynamic(() => Promise.resolve(Cabs), { ssr: false });
