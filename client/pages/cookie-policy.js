import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import DefaultHeader from "../components/header/header";
import Footer from "../components/footer/footer";
import CookiePolicy from "../components/common/CookiePolicy";

const CookiePolicyPage = () => (
  <>
    <Seo pageTitle="Cookie Policy" />
    <div className="header-margin"></div>
    <DefaultHeader />
    <section className="layout-pt-lg layout-pb-lg">
      <div className="container">
        <div className="tabs js-tabs">
          <CookiePolicy />
        </div>
      </div>
    </section>
    <Footer />
  </>
);

export default dynamic(() => Promise.resolve(CookiePolicyPage), { ssr: false });
