import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import Footer from "../components/footer/footer";
import DefaultHeader from "../components/header/header";
import PrivacyPolicy from "../components/common/PrivacyPolicy";

const Terms = () => (
  <>
    <Seo pageTitle="Privacy policy" />
    <div className="header-margin"></div>
    <DefaultHeader />
    <section className="layout-pt-lg layout-pb-lg">
      <div className="container">
        <div className="tabs js-tabs">
          <PrivacyPolicy />
        </div>
      </div>
    </section>
    <Footer />
  </>
);

export default dynamic(() => Promise.resolve(Terms), { ssr: false });
