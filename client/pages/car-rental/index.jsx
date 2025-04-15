import React, { useState } from "react";
import Faq from "../../components/faq/Faq";
import Seo from "../../components/common/Seo";
import Header1 from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ExtraLogin from "../../components/home/home/ExtraLogin";
import NewsletterSection from "../../components/home/home/Newsletter";
import MainFilterSearchBox from "../../components/car-list/car-list-v1/MainFilterSearchBox";
import CarPropertes from "../../components/car-list/car-list-v1/CarPropertes";
import dynamic from "next/dynamic";

const Cabs = () => {
  const [carData, setCarData] = useState(
  );


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
                  Cabs Hire for any kind of trip
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

              <MainFilterSearchBox setCarData={setCarData} />
            </div>
          </div>
        </div>
      </section>

      {/* cabs list */}
      {carData?.searchDetails?.data?.length > 0 && (
        <section className="layout-pt-md layout-pb-md">
          <div className="container">
            <div className="row y-gap-30">
              <div className="col-xl-9 ">
                <div className="row y-gap-30">
                  <CarPropertes carsData={carData} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      <ExtraLogin />
      <Faq />
      <NewsletterSection />
      <Footer />
    </>
  );
};

export default dynamic(() => Promise.resolve(Cabs), { ssr: false });
