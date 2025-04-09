import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import DefaultHeader from "../components/header/header";
import Footer from "../components/footer/footer";
import GenTerms from "../components/common/GenTerms";

const Terms = () => (
  <>
    <Seo pageTitle="General Terms of Use" />
    <div className="header-margin"></div>
    <DefaultHeader />
    <section className="layout-pt-lg layout-pb-lg">
      <div className="container">
        <div className="tabs js-tabs">
          <GenTerms />
        </div>
      </div>
    </section>
    <Footer />
  </>
);

export default dynamic(() => Promise.resolve(Terms), { ssr: false });
