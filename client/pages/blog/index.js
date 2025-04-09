import React from "react";
// import CallToActions from "../../components/common/CallToActions";
import Seo from "../../components/common/Seo";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Blog from "../../components/blog/Blog";

const BlogListV1 = () => {
  return (
    <>
      <Seo pageTitle="Blog" />

      <div className="header-margin"></div>

      <Header />
      <section className="layout-pt-md layout-pb-lg">
        <div className="container">
          <div className="row layout-pb-md">
            <div className="col-12 text-center">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">
                  Get inspiration for your next trip
                </h2>
                <p className="sectionTitle__text mt-5 sm:mt-0">
                  Discover New Destinations & Unforgettable Adventures
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <Blog  />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default BlogListV1;
