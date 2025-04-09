import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import Header from "../components/header/header";
import Hero from "../components/hero/hero";
import TopFlights from "../components/home/home/Locations";
import DiscountBanner from "../components/home/home/DiscountBanner";
import AppBanner from "../components/home/home/BannerHero";
import Footer from "../components/footer/footer";
import ExtraLogin from "../components/home/home/ExtraLogin";
import Faq from "../components/faq/Faq";
import PopularRoutes from "../components/home/home/PopularRoutes";
import Blogs from "../components/blog/Blog";
import OffersDeals from "../components/home/home/Offers";
import Review from "../components/home/home/Review";
import NewsletterSection from "../components/home/home/Newsletter";

const Home = () => (
  <>
    <Seo pageTitle="Flight Booking" />
    <Header />
    <Hero />
    <OffersDeals />
    <AppBanner />
    <PopularRoutes />

    {/* Blogs Section */}
    <div style={{ background: "linear-gradient(to top, white, #f3f2f2)" }}>
      <section className="layout-pt-md">
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-auto">
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
          <div className="row y-gap-30 pt-40">
            <Blogs />
          </div>
        </div>
      </section>
    </div>

    <ExtraLogin />
    <DiscountBanner />
    <TopFlights />
    <Review />

    {/* FAQ Section */}
    <Faq />
    <NewsletterSection />
    <Footer />
  </>
);

export default dynamic(() => Promise.resolve(Home), { ssr: false });
