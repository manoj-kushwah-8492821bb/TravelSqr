import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import Faq from "../components/faq/Faq";
import DefaultHeader from "../components/header/header";
import HelpBlock from "../components/block/HelpBlock";
import Footer from "../components/footer/footer";

const HelpCenter = () => (
  <>
    <Seo pageTitle="Help Center" />
    <div className="header-margin"></div>
    <DefaultHeader />

    <section className="layout-pt-md">
      <div className="container text-center">
        <h2 className="sectionTitle__title">Welcome to the Help Center</h2>
        <p className="sectionTitle__text mt-5 sm:mt-0">
          Need help? We’re here for you.
        </p>
        <div className="row y-gap-30 pt-60 lg:pt-40">
          <HelpBlock />
        </div>
      </div>
    </section>

    <Faq />
    <Footer />
  </>
);

export default dynamic(() => Promise.resolve(HelpCenter), { ssr: false });
