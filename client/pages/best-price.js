import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import DefaultHeader from "../components/header/header";
import DefaultFooter from "../components/footer/footer";
import BestPrice from "../components/common/BestPrice";

const BestPricePage = () => (
  <>
    <Seo pageTitle="Best Price Guarantee" />
    <div className="header-margin"></div>
    <DefaultHeader />
    <section className="layout-pt-lg layout-pb-lg">
      <div className="container">
        <div className="tabs js-tabs">
          <BestPrice />
        </div>
      </div>
    </section>
    <DefaultFooter />
  </>
);

export default dynamic(() => Promise.resolve(BestPricePage), { ssr: false });
