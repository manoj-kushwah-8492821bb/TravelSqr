import { useState,useEffect } from "react";
import { useSelector } from 'react-redux';
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
const FlightSearch = () => {
  const [airlinesClick,setAirlinesClick] = useState([]);
  const [stopsClick,setStopsClick] = useState([]);
  const [cabinsClick,setCabinsClick] = useState('');
  const [pricesClick,setPricesClick] = useState('');
  const [maxPrice,setMaxPrice] = useState(100000);
  const [flagStatus,setFlagStatus] = useState(1);
  
  let searchResult = useSelector((state) => state.flightSearch);

  const getMaxPrice = (searchData) => {
    //return searchResult?.flightSearch?.data?.reduce((max, b) => Math.max(max, b.price.grandTotal), searchResult.flightSearch.data[0].price.grandTotal);
  }

  useEffect(()=>{
    setMaxPrice(getMaxPrice(searchResult));
  },[searchResult]);

  const airLineClick = (e) => {
    if(e.target.checked){
      setAirlinesClick([...airlinesClick, e.target.value]);
    }else{
      setAirlinesClick(airlinesClick.filter((item) => item !== e.target.value));
    }
  }
  const stopClick = (e) => {
    if(e.target.checked){
      setStopsClick([...stopsClick, e.target.value]);
    }else{
      setStopsClick(stopsClick.filter((item) => item !== e.target.value));
    }
  }
  const cabinClick = (e) => {
    if(e.target.checked){
      setCabinsClick(e.target.value);
    }else{
      setCabinsClick('');
    }
  }
  const priceClick = (price) => {
    setPricesClick(price);
  }
  const flag = (val) => {
    setFlagStatus(val);
  }
  return (
    <>
      <Seo pageTitle="Flight Serach" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header10 />
      {/* End Header 1 */}

      <section className="pt-40 pb-40">
        <div className="container">
          <MainFilterSearchBox flag={flag} airlinesClick={airlinesClick} cabinsClick={cabinsClick} pricesClick={pricesClick}/>
        </div>
      </section>
      {/* Top SearchBanner */}

      <section className="layout-pt-md layout-pb-md bg-light-2">
        <div className="container">
          <div className="row y-gap-30">
            <div className="col-xl-3">
              <aside className="sidebar py-20 px-20 xl:d-none bg-white">
                <div className="row y-gap-40">
                <Sidebar flagStatus={flagStatus} airLineClick={airLineClick} stopClick={stopClick} cabinClick={cabinClick} priceClick={priceClick} countResult={searchResult.flightSearch.count} selectCabin = {searchResult.FlightStateData.selectedClass} maxPrice={maxPrice}/>
                </div>
              </aside>
              {/* End sidebar for desktop */}

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
                {/* End offcanvas header */}

                <div className="offcanvas-body">
                  <aside className="sidebar y-gap-40  xl:d-block">
                    <Sidebar airLineClick={airLineClick} stopClick={stopClick} cabinClick={cabinClick} priceClick={priceClick} countResult={searchResult.flightSearch.count} selectCabin = {searchResult.FlightStateData.selectedClass} maxPrice={maxPrice}/>
                  </aside>
                </div>
                {/* End offcanvas body */}
              </div>
              {/* End mobile menu sidebar */}
            </div>
            {/* End col */}

            <div className="col-xl-9 ">
              <TopHeaderFilter countResult={searchResult.flightSearch.count}/>

              <div className="row">
                <FlightProperties searchResult={searchResult}/>
              </div>
              {/* End .row */}
              {/* <Pagination /> */}
            </div>
            {/* End .col for right content */}
          </div>
          {/* End .row */}
        </div>
        {/* End .container */}
      </section>
      {/* End layout for listing sidebar and content */}

      {/* <CallToActions /> */}
      {/* End Call To Actions Section */}

      <Footer />
    </>
  );
};

export default FlightSearch;
