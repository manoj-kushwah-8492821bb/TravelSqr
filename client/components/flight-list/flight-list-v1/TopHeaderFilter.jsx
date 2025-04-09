import { useEffect, useState } from "react";
import { useSelector,useDispatch } from "react-redux";
import { FlightSuccess } from "../../../features/FlightSearchSlice";

const TopHeaderFilter = (props) => {
  const dispatch = useDispatch();
  let initialFlightData  = useSelector((state) => state?.flightSearch);
  const [count,setCount] = useState(null);
  let searchResult = useSelector(
    (state) => state.flightSearch.flightSearch.count
  );
  const [flightData,setFlightData] = useState({})
  const [status,setStatus] = useState(0)
  const sortData = () => {

    if(status===0){
      const sortedFlights = [...flightData.flightSearch.data].sort(
        (a, b) => parseFloat(b.price.grandTotal) - parseFloat(a.price.grandTotal)
      );
      setStatus(1);
      const mid = {count:sortedFlights.length,data: sortedFlights,dictionaries:initialFlightData.flightSearch.dictionaries};
      dispatch(FlightSuccess(mid));
      setFlightData({ ...flightData, flightSearch: { ...flightData.flightSearch, data: sortedFlights } });
    }else{
      const sortedFlights = [...flightData.flightSearch.data].sort(
        (a, b) => parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal)
      );
      setStatus(0);
      const mid = {count:sortedFlights.length,data: sortedFlights,dictionaries:initialFlightData.flightSearch.dictionaries};
      dispatch(FlightSuccess(mid));
      setFlightData({ ...flightData, flightSearch: { ...flightData.flightSearch, data: sortedFlights } });
    }

  };
  useEffect(() => {
    setFlightData(initialFlightData);
  }, [initialFlightData]);

  useEffect(() => {
    setFlightData(initialFlightData);
    let count1 = 0; 
    {initialFlightData?.flightSearch?.data?.map((item) => 
      (  
        props?.stopsClick.includes(item?.itineraries[0]?.segments?.length?.toString())==true || props?.stopsClick?.length==0 ?
        count1=count1+1:null
      )
    )}
    setCount(count1)
  }, [props?.stopsClick]);
  
  return (
    <>
      <div className="row y-gap-10 items-center justify-between">
      {props?.totalFlightCount!=0 && count>0 &&
        <div className="col-auto">
          <div className="text-18">
              <span className="fw-500">{count} Flights</span> found
            </div>
        </div>
      }
        {/* <div className="col-auto">
          {
            props?.stopsClick?.length>0?
            count != null ? (
            <div className="text-18">
              <span className="fw-500">{count} Flights</span> found1
            </div>
            ) : null
            :
          props?.countResult != null && props?.countResult>0 ? (
            <div className="text-18">
              <span className="fw-500">{props?.countResult} Flights</span> found2
            </div>
          ) : null
        }
        </div> */}
        {/* End .col */}
{props?.countResult != null && props?.countResult>0 &&
<>
        <div className="col-auto">
          <div className="row x-gap-20 y-gap-20">
            <div className="col-auto">
              <button
                className="button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1"
                onClick={sortData}
              >
                <i className="icon-up-down text-14 mr-10" />
                Price
              </button>
            </div>
            {/* End .col */}

            {/* <div className="col-auto d-none xl:d-block">
              <button
                data-bs-toggle="offcanvas"
                data-bs-target="#listingSidebar"
                className="button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1"
              >
                <i className="icon-up-down text-14 mr-10" />
                Filter
              </button>
            </div> */}
            {/* End .col */}
          </div>
          {/* End .row */}
        </div>
        {/* End .col */}
</>
}
      </div>
      {/* End .row */}
    </>
  );
};

export default TopHeaderFilter;
