import React from "react";
import { request } from "../../api/Api";
import Seo from "../../components/common/Seo";
import DefaultHeader from "../../components/header/header";
import Footer from "../../components/footer/footer";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

import DesctinationCard from "./DesctinationCard";
import DestinationCardSkeleton from "./DestinationCardSkeleton";

const Index = () => {
  const [detination, setSetination] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const getDestinations = async () => {
    setIsLoading(true);
    const promiseToken = await request("flight/destinations", {}, "get");
    if (promiseToken?.response?.succeeded === false) {
      toast.error(
        promiseToken?.response?.succeeded ===
          false.response?.data?.ResponseMessage
      );
    } else {
      setSetination(promiseToken?.response?.ResponseBody);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    getDestinations();
  }, []);

  return (
    <>
      <Seo pageTitle="Destinations" />

      <div className="header-margin"></div>

      <DefaultHeader />

      <section className="layout-pt-md layout-pb-lg">
        <div className="container">
          <div className="row y-gap-20 justify-between items-center">
            <div className="row y-gap-30">
              {isLoading ? (
                <>
                  {Array(12)
                    .fill("")
                    .map((item, index) => {
                      return (
                        <div key={index} className="col">
                          <DestinationCardSkeleton />
                        </div>
                      );
                    })}
                </>
              ) : (
                detination?.map((item, index) => (
                  <div
                    className="col-lg-3 col-sm-6"
                    key={item?._id}
                    data-aos="fade"
                    data-aos-delay={100 * index}
                  >
                    <DesctinationCard item={item} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default dynamic(() => Promise.resolve(Index), { ssr: false });
