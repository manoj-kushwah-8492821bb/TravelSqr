import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import DefaultHeader from "../components/header/header";
import WhyChoose from "../components/block/BlockGuide";
import Block1 from "../components/about/Block1";
import Footer from "../components/footer/footer";
import Testimonial from "../components/testimonial/Testimonial";

import { request } from "../api/Api";
import { useState, useEffect } from "react";

const About = () => {
  const [data, setData] = useState("");
  const getData = async () => {
    const promise = await request("user/cms-about-us", {}, "get");
    if (promise.error) {
    } else {
      if (promise.response.succeeded === true) {
        setData(promise.response.ResponseBody.content);
      } else {
        setData("No content found.");
      }
    }
  };
  useEffect(() => {
    getData();
  });
  return (
    <>
      <Seo pageTitle="About" />

      <div className="header-margin"></div>

      <DefaultHeader />

      <section
        className="section-bg layout-pt-md layout-pb-md"
        style={{ backgroundColor: "#19357b" }}
      >
        <div className="container">
          <div
            className="row justify-content-center align-items-center"
            style={{ textAlign: "center" }}
          >
            <div className="col-xl-6 col-lg-8 col-md-10">
              <h1 className="text-25 md:text-15 fw-400 text-white">About Us</h1>
              <h1 className="text-40 md:text-25 fw-600 text-white">
                Looking for joy?
              </h1>
              <div className="text-white mt-15">
                Your trusted trip companion
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* End About Banner Section */}
      <section style={{ paddingTop: "45px", paddingBottom: "0px" }}>
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">
                  The Journey to the Perfect Adventure Starts with Us{" "}
                </h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  Search. Select. Schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row y-gap-30 justify-between items-center">
            <Block1 data={data} />
          </div>
        </div>
      </section>
      <section style={{ paddingTop: "45px", paddingBottom: "0px" }}>
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">Why Choose Us</h2>
              </div>
            </div>
          </div>

          <div className="row y-gap-40 justify-between pt-10">
            <WhyChoose />
          </div>
        </div>
      </section>

      <section className="section-bg layout-pt-md layout-pb-md">
        <div className="section-bg__item -mx-20 bg-white-2" />
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">
                  Overheard from travelers
                </h2>
              </div>
            </div>
          </div>

          <div className="overflow-hidden pt-20 js-section-slider">
            <div className="item_gap-x30">
              <Testimonial />
            </div>
          </div>
        </div>
      </section>

      {/* <CallToActions /> */}
      <Footer />
    </>
  );
};

export default dynamic(() => Promise.resolve(About), { ssr: false });
