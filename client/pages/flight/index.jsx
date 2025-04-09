import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CallToActions from "../../components/common/CallToActions";
import Seo from "../../components/common/Seo";
//import Header10 from "../../components/header/header";
import Header10 from "../../components/header/header";
import DefaultFooter from "../../components/footer/footer";
import MainFilterSearchBox from "../../components/hero/hero/MainFilterSearchBox";
import TopHeaderFilter from "../../components/flight-list/flight-list-v1/TopHeaderFilter";
import FlightProperties from "../../components/flight-list/flight-list-v1/FlightProperties";
import Pagination from "../../components/flight-list/common/Pagination";
import Sidebar from "../../components/flight-list/flight-list-v1/Sidebar";
import Footer from "../../components/footer/footer";
import Loader from "./Loader";
const Index = () => {
  const [airlinesClick, setAirlinesClick] = useState([]);
  const [stopsClick, setStopsClick] = useState([]);
  const [cabinsClick, setCabinsClick] = useState("");
  const [pricesClick, setPricesClick] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [flagStatus, setFlagStatus] = useState(1);
  const [loader, setLoader] = useState(0);
  const [count, setCount] = useState(null);

  const [clStatus, setClStatus] = useState(1);
  {
    /*1=cabin,2=price*/
  }

  let searchResult = useSelector((state) => state.flightSearch);

  const getMaxPrice = () => {
    return searchResult?.flightSearch?.data?.reduce(
      (max, b) => Math.max(max, b.price.grandTotal),
      searchResult.flightSearch.data[0].price.grandTotal
    );
  };

  useEffect(() => {
    // if(flagStatus==1){
    //   setMaxPrice(getMaxPrice());
    // }
    if (searchResult?.flightSearch?.data?.length > 0) {
      setMaxPrice(getMaxPrice());
    }
  }, [searchResult]);

  // useEffect(()=>{
  //   if(flagStatus==1){
  //     console.log('sachin123');
  //   }
  // },[searchResult]);

  // useEffect(()=>{console.log(flagStatus);
  //   if(flagStatus==2){
  //     setMaxPrice(getMaxPrice(searchResult));
  //   }
  // },[searchResult])

  const airLineClick = (e) => {
    setClStatus(1);
    if (e.target.checked) {
      setAirlinesClick([...airlinesClick, e.target.value]);
    } else {
      setAirlinesClick(airlinesClick.filter((item) => item !== e.target.value));
    }
  };
  const stopClick = (e) => {
    setClStatus(1);
    if (e.target.checked) {
      setStopsClick([...stopsClick, e.target.value]);
    } else {
      setStopsClick(stopsClick.filter((item) => item !== e.target.value));
    }
  };
  const cabinClick = (e) => {
    setClStatus(0);
    if (e.target.checked) {
      setCabinsClick(e.target.value);
    } else {
      setCabinsClick("");
    }
  };
  const priceClick = (price) => {
    setClStatus(2);
    setPricesClick(price);
  };
  const flag = (val) => {
    if (val == 1) {
      setAirlinesClick([]);
    }
    setFlagStatus(val);
    setLoader(1);
  };
  const loadingStatus = () => {
    setLoader(0);
  };
  const totalCount = (count) => {
    setCount(count);
  };
  useEffect(() => {
    localStorage.removeItem("data");
    localStorage.removeItem("success");
    const handleBeforeUnload = (event) => {
      const message = "Are you sure you want to leave?";
      event.returnValue = message; // Standard for most browsers
      return message; // For some older browsers
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <Seo pageTitle="Flight Search" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header10 />
      {/* End Header 1 */}
      <section style={{ backgroundColor: "#2a50bf" }} className="py-90">
        <div className="container ">
          <MainFilterSearchBox
            clStatus={clStatus}
            totalFlightCount={
              (count != null && count > 0) || flagStatus == 2 ? 1 : 0
            }
            loadingStatus={loadingStatus}
            flag={flag}
            airlinesClick={airlinesClick}
            cabinsClick={cabinsClick}
            pricesClick={pricesClick}
          />
        </div>
      </section>
      {/* Top SearchBanner */}

      <section
        className="layout-pt-md layout-pb-md bg-light-2"
        style={{
          backgroundImage:
            searchResult?.flightSearch?.count > 0
              ? "none"
              : "url('/img/general/flightloader.gif')",
          backgroundSize:
            searchResult?.flightSearch?.count > 0 ? "auto" : "cover",
          backgroundPosition:
            searchResult?.flightSearch?.count > 0 ? "initial" : "center",
          minHeight: searchResult?.flightSearch?.count > 0 ? "auto" : "75vh",
          width: "100%",
        }}
      >
        <div className="container">
          {searchResult?.flightSearch?.count > 0 ? (
            <div className="row y-gap-30">
              {(count != null && count > 0) || flagStatus == 2 ? (
                <>
                  <div className="col-xl-3">
                    <aside className="sidebar py-20 px-20 xl:d-none bg-white">
                      <div className="row y-gap-40">
                        <Sidebar
                          flagStatus={flagStatus}
                          airLineClick={airLineClick}
                          stopClick={stopClick}
                          cabinClick={cabinClick}
                          priceClick={priceClick}
                          countResult={searchResult.flightSearch.count}
                          selectCabin={
                            searchResult.FlightStateData.selectedClass
                          }
                          maxPrice={maxPrice}
                        />
                      </div>
                    </aside>
                    <div
                      className="offcanvas offcanvas-start"
                      tabIndex="-1"
                      id="listingSidebar"
                    >
                      <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="offcanvasLabel">
                          Filter Tours
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="offcanvas"
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="offcanvas-body">
                        <aside className="sidebar y-gap-40  xl:d-block">
                          <Sidebar
                            flagStatus={flagStatus}
                            airLineClick={airLineClick}
                            stopClick={stopClick}
                            cabinClick={cabinClick}
                            priceClick={priceClick}
                            countResult={searchResult.flightSearch.count}
                            selectCabin={
                              searchResult.FlightStateData.selectedClass
                            }
                            maxPrice={maxPrice}
                          />
                        </aside>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-9 ">
                    <TopHeaderFilter
                      totalFlightCount={count != null && count > 0 ? 1 : 0}
                      countResult={count}
                      stopsClick={stopsClick}
                    />

                    <div className="row">
                      {typeof searchResult.flightSearch.count !== "number" ? (
                        loader == 0 ? (
                          <FlightProperties
                            searchResult={searchResult}
                            stopsClick={stopsClick}
                            totalCount={totalCount}
                          />
                        ) : (
                          <div className="col">
                            <Loader />
                          </div>
                        )
                      ) : (
                        <FlightProperties
                          searchResult={searchResult}
                          stopsClick={stopsClick}
                          totalCount={totalCount}
                        />
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-xl-12 ">
                  <TopHeaderFilter
                    countResult={count}
                    stopsClick={stopsClick}
                  />

                  <div className="row">
                    {typeof searchResult.flightSearch.count !== "number" ? (
                      loader == 0 ? (
                        <FlightProperties
                          searchResult={searchResult}
                          stopsClick={stopsClick}
                          totalCount={totalCount}
                        />
                      ) : (
                        <div className="col">
                          <Loader />
                        </div>
                      )
                    ) : (
                      <FlightProperties
                        searchResult={searchResult}
                        stopsClick={stopsClick}
                        totalCount={totalCount}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="text-center py-40 "
              style={{ fontSize: "24px", fontWeight: "bold" }}
            >
              No Flights Found
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Index;
