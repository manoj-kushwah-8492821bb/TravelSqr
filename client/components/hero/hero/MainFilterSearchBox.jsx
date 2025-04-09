import Router, { useRouter } from "next/router";
import DateSearch from "../DateSearch";
import GuestSearch from "./GuestSearch";
import FlyingFromLocation from "./FlyingFromLocation";
import FlyingToLocation from "./FlyingToLocation";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { request } from "../../../api/Api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toFormData } from "axios";
import moment from "moment";
// import FilterSelect from "../hero-10/FilterSelect";
import flightsList from "../../flight/Flights";
import { useDispatch, useSelector } from "react-redux";
import { FlightSuccess, FlightState, } from "../../../features/FlightSearchSlice";
import { AddAirlines, RemoveAirlines } from "../../../features/SidebarSlice";
import { PriceChange } from "../../../features/MaxPriceSlice";
import { CurrencyChange } from "../../../features/CurrencySlice";
import { Spinner } from "reactstrap";

/** Counter start */
const Counter = ({
  name,
  defaultValue,
  onCounterChange,
  allCount,
  showError,
}) => {
  const [count, setCount] = useState(defaultValue);
  const incrementCount = () => {
    if (allCount.Adults + allCount.Children + allCount.Infants > 8) {
      showError("Total count of passengers should not be greater than 9");
    } else {
      if (name === "Infants") {
        if (allCount.Infants == allCount.Adults) {
          showError("Infant should not be greater than adults");
        } else {
          setCount(count + 1);
          onCounterChange(name, count + 1);
          showError("");
        }
      } else {
        setCount(count + 1);
        onCounterChange(name, count + 1);
        showError("");
      }
    }
  };
  const decrementCount = () => {
    if (name === "Infants") {
      showError("");
    }
    if (name === "Adults") {
      if (allCount.Infants == allCount.Adults) {
        showError("Infant should not be greater than adults");
      } else {
        if (count > 1) {
          setCount(count - 1);
          onCounterChange(name, count - 1);
          showError("");
        } else {
          showError("Adult passengers should be greater than 0");
        }
      }
    } else {
      if (count > 0) {
        setCount(count - 1);
        onCounterChange(name, count - 1);
      }
    }
  };

  return (
    <>
      <div className="row y-gap-10 justify-between items-center">
        <div className="col-auto">
          <div className="text-15 lh-12 fw-500">
            {name}
            {name === "Children" && "s"}
          </div>
          {name === "Children" && (
            <div className="text-14 lh-12 text-light-1 mt-5">2-12 years</div>
          )}
          {name === "Adults" && (
            <div className="text-14 lh-12 text-light-1 mt-5">12+ years</div>
          )}
          {name === "Infants" && (
            <div className="text-14 lh-12 text-light-1 mt-5">0-2 years</div>
          )}
        </div>
        {/* End .col-auto */}
        <div className="col-auto">
          <div className="d-flex items-center js-counter">
            {name === "Adults" && allCount.Infants == allCount.Adults ? (
              <button
                className="-outline-blue-1 text-blue-1 size-38 rounded-4 js-down"
                style={{ backgroundColor: "#F1F3F5" }}
                disabled={true}
              >
                <i className="icon-minus text-12" />
              </button>
            ) : count > 0 ? (
              <button
                className="button -outline-blue-1 text-blue-1 size-38 rounded-4 js-down"
                onClick={decrementCount}
              >
                <i className="icon-minus text-12" />
              </button>
            ) : (
              <button
                className="-outline-blue-1 text-blue-1 size-38 rounded-4 js-down"
                style={{ backgroundColor: "#F1F3F5" }}
                disabled={true}
              >
                <i className="icon-minus text-12" />
              </button>
            )}
            {/* decrement button */}
            <div className="flex-center size-20 ml-15 mr-15">
              <div className="text-15 js-count">{count}</div>
            </div>
            {/* counter text  */}
            {allCount.Adults + allCount.Children + allCount.Infants > 8 ? (
              <button
                className="-outline-blue-1 text-blue-1 size-38 rounded-4 js-down"
                disabled={true}
                style={{ backgroundColor: "#F1F3F5" }}
              >
                <i className="icon-plus text-12" />
              </button>
            ) : name === "Infants" && allCount.Infants == allCount.Adults ? (
              <button
                className="-outline-blue-1 text-blue-1 size-38 rounded-4 js-down"
                disabled={true}
                style={{ backgroundColor: "#F1F3F5" }}
              >
                <i className="icon-plus text-12" />
              </button>
            ) : (
              <button
                className="button -outline-blue-1 text-blue-1 size-38 rounded-4 js-down"
                onClick={incrementCount}
              >
                <i className="icon-plus text-12" />
              </button>
            )}
          </div>
        </div>
        {/* End .col-auto */}
      </div>
      {/* End .row */}
      <div className="border-top-light mt-24 mb-24" />
    </>
  );
};
/** Counter end */

const MainFilterSearchBox = (props) => {
  const dispatch = useDispatch();
  let searchState = useSelector(
    (state) => state?.flightSearch?.FlightStateData
  ); //console.log("sachin",searchState);
  let airLineList = useSelector((state) => state?.SidebarData?.airlines);
  let currencyData = useSelector((state) => state?.CurrencySlice?.currencyData);
  let maxPriceRedux = useSelector((state) => state?.MaxPriceSlice?.max?.apiMax);
  let maxPriceCabinClick = useSelector(
    (state) => state?.MaxPriceSlice?.max?.price
  );
  const [loading, setLoading] = useState(false);
  const counters = [
    {
      name: "Adults",
      defaultValue: searchState.adults == undefined ? 1 : searchState.adults,
    },
    {
      name: "Children",
      defaultValue:
        searchState.children == undefined ? 0 : searchState.children,
    },
    {
      name: "Infants",
      defaultValue: searchState.infants == undefined ? 0 : searchState.infants,
    },
  ];
  const router = useRouter();
  const [searchValueFrom, setSearchValueFrom] = useState(
    searchState.searchValueFrom
  );
  const [searchValueTo, setSearchValueTo] = useState(searchState.searchValueTo);
  const [selectedItemFrom, setSelectedItemFrom] = useState(null);
  const [selectedItemTo, setSelectedItemTo] = useState(null);
  const [locationSearchContent, setLocationSearchContent] = useState([]);
  const [flightData, setFlightData] = useState({});
  const [flightFrom, setFlightFrom] = useState(searchState?.flightFrom);
  const [flightTo, setFlightTo] = useState(searchState.flightTo);
  const [datesFrom, setDatesFrom] = useState(searchState.datesFrom);
  //const [datesFromE, setDatesFromE] = useState(moment(new Date()).format("DD MMMM YYYY"));
  const [datesFromE, setDatesFromE] = useState(moment().format("DD MMMM YYYY"));
  const [datesTo, setDatesTo] = useState(searchState.datesTo);
  const [guestCounts, setGuestCounts] = useState({
    Adults: searchState.adults == undefined ? 1 : searchState.adults,
    Children: searchState.children == undefined ? 0 : searchState.children,
    Infants: searchState.infants == undefined ? 0 : searchState.infants,
  });
  const [selectedClass, setSelectedClass] = useState(
    searchState.selectedClass ? searchState.selectedClass : "ECONOMY"
  );
  const [selectedTrip, setSelectedTrip] = useState(
    searchState.selectedTrip ? searchState.selectedTrip : false
  );

  //const [todayDayFrom, setTodayDayFrom] = useState(searchState.datesFrom=='undefined'?moment(new Date()).format("dddd"):moment(searchState.datesFrom).format("dddd"));
  const [todayDayFrom, setTodayDayFrom] = useState(
    searchState.datesFrom == "undefined"
      ? moment().format("dddd")
      : moment(searchState.datesFrom).format("dddd")
  );
  const [todayDayTo, setTodayDayTo] = useState(
    searchState.datesTo == "undefined"
      ? moment().format("dddd")
      : moment(searchState.datesTo).format("dddd")
  );
  //const [todayDayTo, setTodayDayTo] = useState(searchState.datesTo=='undefined'?moment(new Date()).format("dddd"):moment(searchState.datesTo).format("dddd"));
  const [addReturnDate, setAddReturnDate] = useState(
    searchState.addReturnDate ? searchState.addReturnDate : false
  );
  const [error, setError] = useState({ from: "", to: "" });

  const [clickStatus, setClickStatus] = useState(false);
  const [clickStopStatus, setClickStopStatus] = useState(false);
  const [clickTclassStatus, setClickTclassStopStatus] = useState(false);
  const [passengerError, setPassengerError] = useState("");
  //const [ airlinesClick, setAirlinesClick ] = useState([]);
  // const locationSearchContent = new Array()

  function isEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }

    return true;
  }

  const flightOfferSearch = async (
    flag,
    from,
    to,
    departDate = "",
    returnDate = "",
    adults = 1,
    children = 0,
    infants = 0,
    currencyCode = "USD",
    travelClass = "ECONOMY",
    max = 10
  ) => {
    //console.log(`originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${departDate}&returnDate=${returnDate}&adults=${adults}&children=${children}&infants=${infants}&currencyCode=${currencyCode}&travelClass=${travelClass}&max=10`);
    let exDataAirLines = "";
    if (flag == 2) {
      if (props?.airlinesClick?.length > 0) {
        exDataAirLines = `&includedAirlineCodes=${props.airlinesClick.toString()}`;
      }
    }

    // let exDataStop = '';
    // if(props?.stopsClick?.length>0){
    //   if(props?.stopsClick?.length==1){
    //     exDataStop = `&nonStop=${props.stopsClick[0]}`;
    //   }
    // }

    let exDataCabin = "";
    if (flag == 1) {
      exDataCabin = `&travelClass=${selectedClass}`;
    } else {
      if (props?.cabinsClick && props?.cabinsClick != "") {
        exDataCabin = `&travelClass=${props.cabinsClick}`;
      } else {
        exDataCabin = `&travelClass=${selectedClass}`;
      }
    }

    let exDataprice = "";
    if (flag == 2 && props.clStatus != 0) {
      if (maxPriceRedux > 0) {
        exDataprice = `&maxPrice=${maxPriceRedux}`;
      }
    }

    const promiseToken = await request(
      `flight/flight-offers?originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${departDate}&returnDate=${returnDate}&adults=${adults}&children=${children}&infants=${infants}&currencyCode=${currencyCode}&max=100${exDataAirLines}${exDataCabin}${exDataprice}`,
      {},
      "get"
    );
    if (promiseToken.error) {
      //console.log("sasd",(promiseToken?.error?.response?.data?.response?.body?.errors[0]));
      toast.error("Something went wrong. Please try again later.");
      setLoading(false);
      props.loadingStatus();
    } else {
      if (promiseToken?.response?.succeeded === false) {
        toast.error(promiseToken?.response?.ResponseBody?.detail);
        setLoading(false);
        props.loadingStatus();
      } else {
        setLoading(false);
        setFlightData(promiseToken.response.ResponseBody);

        if (flag == 1) {
          dispatch(
            AddAirlines(
              promiseToken?.response?.ResponseBody?.dictionaries?.carriers
            )
          );
          const maxPrice = promiseToken?.response?.ResponseBody.data?.reduce(
            (max, b) => Math.max(max, b.price.grandTotal),
            promiseToken?.response?.ResponseBody?.data[0]?.price?.grandTotal
          );
          dispatch(PriceChange(Math.round(maxPrice)));
        } else {
          if (props?.clStatus === 0 || props?.clStatus === 2) {
            dispatch(
              AddAirlines(
                promiseToken?.response?.ResponseBody?.dictionaries?.carriers
              )
            );
            const maxPrice = promiseToken?.response?.ResponseBody.data?.reduce(
              (max, b) => Math.max(max, b.price.grandTotal),
              promiseToken?.response?.ResponseBody?.data[0]?.price?.grandTotal
            );
            if (!(maxPrice == "" || maxPrice == undefined)) {
              if (maxPrice > maxPriceCabinClick) {
                dispatch(PriceChange(Math.round(maxPrice)));
              }
            }
          }
        }

        dispatch(FlightSuccess(promiseToken.response.ResponseBody));
        dispatch(
          FlightState({
            searchValueFrom: searchValueFrom,
            searchValueTo: searchValueTo,
            flightFrom: flightFrom,
            flightTo: flightTo,
            datesFrom: datesFrom,
            datesTo: datesTo,
            adults: adults,
            children: children,
            infants: infants,
            selectedClass: selectedClass,
            selectedTrip: selectedTrip,
            addReturnDate: addReturnDate,
          })
        );
        if (router.pathname == "/") {
          router.push({
            pathname: "/flight",
          });
        }
      }
    }
  };

  /** get Airports data for from or too */
  const getData = async (search = "") => {
    const promiseToken = await request(
      `flight/airports?search=${search}&limit=6`,
      {},
      "get"
    );
    if (promiseToken.error) {
      //toast.error(promiseToken.error.response.data.ResponseMessage);
    } else {
      setLocationSearchContent(promiseToken.response.ResponseBody?.docs);
    }
  };

  const onHandleChange = async (e, type) => {
    if (type == 1) {
      setSearchValueFrom(e.target.value);
      if (
        e.target.value != undefined &&
        e.target.value != "" &&
        e.target.value == flightTo
      ) {
        setError({
          ...error,
          from: "Source and destination should not be same.",
        });
      } else {
        setError({ ...error, from: "" });
      }
    } else {
      setSearchValueTo(e.target.value);
      if (
        e.target.value != undefined &&
        e.target.value != "" &&
        e.target.value == flightFrom
      ) {
        setError({
          ...error,
          to: "Source and destination should not be same.",
        });
      } else {
        setError({ ...error, to: "" });
      }
    }

    //if (e.target.value.length > 2) {
    await getData(e.target.value);
    //}
  };

  const handleCounterChange = (name, value) => {
    setGuestCounts((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleOptionClick = (item, type) => {
    let mid = { to: "", from: "" };
    if (type == 1) {
      mid.from = "";
      //setError({...error,from:''});
    }
    if (type == 2) {
      mid.to = "";
      //setError({...error,to:''});
    }
    if (type == 1) {
      //setSearchValueFrom(`${item.name} (${item.code})`);
      setSearchValueFrom(`${item.name}`);
      setFlightFrom(item?.code);
      setSelectedItemFrom(item);
      if (
        item?.code != undefined &&
        item?.code != "" &&
        item?.code == flightTo
      ) {
        mid.to = "Source and destination should not be same.";
        //setError({...error,to:'Source and destination should not same.'});
      } else {
        mid.to = "";
        //setError({...error,to:'',from:''});
      }
    } else {
      //setSearchValueTo(`${item.name} (${item.code})`);
      setSearchValueTo(`${item.name}`);
      setFlightTo(item?.code);
      setSelectedItemTo(item);
      if (
        item?.code != undefined &&
        item?.code != "" &&
        item?.code == flightFrom
      ) {
        mid.to = "Source and destination should not be same.";
        //setError({...error,to:'Source and destination should not same.'});
      } else {
        mid.to = "";
        //setError({...error,to:'',from:''});
      }
    }
    setError({ ...error, to: mid.to, from: mid.from });
    //remove old data
    getData();
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleTripChange = (e) => {
    if (e.target.value == 1) {
      setDatesTo(null);
    } else {
      setDatesTo(datesFrom);
      setTodayDayTo(moment(datesFrom).format("dddd"));
    }
    //setDatesTo(datesFrom);setTodayDayTo(moment(datesFrom).format("dddd"));
    setSelectedTrip(!selectedTrip);
    setAddReturnDate(!addReturnDate);
  };

  const onSubmit = async (flag = 2) => {
    props?.flag(flag);
    //console.log(flightFrom);
    setLoading(true);

    {
      /* Sidebar search blank */
    }
    // if(flag==1){
    //   dispatch(AddAirlines(''));
    // }
    {
      /* Sidebar search blank */
    }
    let err = { from: "", to: "", status: 1 };

    if (flightFrom == "" || flightFrom == undefined) {
      err.from = "Source required";
      err.status = 0;
    } else {
      err.from = "";
    }
    if (flightTo == "" || flightTo == undefined) {
      err.to = "Destination required";
      err.status = 0;
    } else if (flightTo == flightFrom) {
      err.to = "Source and destination should not be same.";
      err.status = 0;
    } else {
      err.to = "";
    }
    //if(guestCounts.Adults+guestCounts.Children+guestCounts.Infants){}

    if (err.status == 0) {
      setError({ ...error, from: err.from, to: err.to });
      setLoading(false);
      props.flag(0); //error comes when searching
      props.loadingStatus();
    } else {
      const fromDateFlight = moment(
        datesFrom === null ? datesFromE : datesFrom
      ).format("YYYY-MM-DD");
      let toDateFlight = "";
      if (datesTo != null) {
        toDateFlight = moment(datesTo).format("YYYY-MM-DD");
      } else if (selectedTrip == true) {
        toDateFlight = moment(
          datesFrom === null ? datesFromE : datesFrom
        ).format("YYYY-MM-DD");
      }
      dispatch(FlightSuccess({}));
      await flightOfferSearch(
        flag,
        flightFrom,
        flightTo,
        fromDateFlight,
        toDateFlight,
        guestCounts.Adults,
        guestCounts.Children,
        guestCounts.Infants,
        currencyData.currency,
        selectedClass
      );
    }
  };

  const removeState = (e, type) => {
    if (type == 1) {
      setSearchValueFrom("");
      setFlightFrom("");
    } else if (type == 2) {
      setSearchValueTo("");
      setFlightTo("");
    }
    getData();
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (props?.airlinesClick?.length > 0 || clickStatus === true) {
      //setAirlinesClick(props.airlinesClick)
      setClickStatus(true);
      onSubmit();
    }
  }, [props?.airlinesClick]);

  // useEffect(()=>{
  //   if(props?.stopsClick?.length>0 || clickStopStatus === true){
  //     setClickStopStatus(true)
  //     onSubmit();
  //   }
  // },[props?.stopsClick])

  useEffect(() => {
    if (props?.cabinsClick || clickTclassStatus === true) {
      setClickTclassStopStatus(true);
      setSelectedClass(props?.cabinsClick);
      onSubmit();
    }
  }, [props?.cabinsClick]);

  useEffect(() => {
    if (props?.pricesClick) {
      onSubmit();
    }
  }, [props?.pricesClick]);

  useEffect(() => {
    if (currencyData.status === true) {
      if (router.pathname != "/") {
        onSubmit(1);
      }
    }
  }, [currencyData]);

  // const styleData = {
  //   display: router.pathname!='/' && 'grid',
  //   gridTemplateColumns: router.pathname!='/' && '160px 160px 160px 160px 250px 210px'
  // }

  const toDateFun = (date) => {
    if (addReturnDate === true) {
      setDatesFrom(date),
        setTodayDayFrom(moment(date).format("dddd")),
        setDatesTo(date),
        setTodayDayTo(moment(date).format("dddd"));
    } else {
      setDatesFrom(date),
        setTodayDayFrom(moment(date).format("dddd")),
        setTodayDayTo(moment(date).format("dddd"));
    }
  };
  const showError = (error) => {
    setPassengerError(error);
  };
  return (
    <>
      <div>
        <div className="radio-box-group flex  text-center w-full">
          <label
            className={`radio-box-trip cursor-pointer py-5 sm:py-5 rounded-5 text-white ${selectedTrip ? "bg-blue-500 border border-blue-500" : "bg-dark-1"
              }`}
        
            onClick={() => setSelectedTrip(false)}
          >
            One Way
          </label>
          <label
            className={`radio-box-trip cursor-pointer ml-4 py-5 sm:py-5 rounded-5 text-white ${!selectedTrip ? "bg-blue-500 border border-blue-500" : "bg-dark-1"
              }`}
          
            onClick={() => setSelectedTrip(true)}
          >
            Round Trip
          </label>
        </div>
      </div>


      <div
        className="mainSearch -col-4 px-20 py-20 lg:px-20 lg:pt-5 lg:pb-20 mt-15 rounded" style={{    backgroundColor: "white"}}
      >

        <div
          className={`h-full items-center flPage grid ${router.pathname !== "/" ? "grid-cols-[auto_auto_200px_min-content]" : ""
            } grid`}
        >

          <div className="h-full searchMenu-loc location lg:py-20 lg:px-0 js-form-dd js-liverSearch"
            style={{ paddingLeft: "18px" }}
          >
            <h4 className="text-15 fw-500 ls-2 lh-16">Flying From</h4>
            <div
              data-bs-toggle="dropdown"
              data-bs-auto-close="true"
              data-bs-offset="0,22"
              style={{ cursor: "pointer" }}
            >
              <div className="text-15 text-light-1 ls-2 lh-16">
                <input
                  tabIndex="-1"
                  autoComplete="off"
                  type="search"
                  placeholder="From Where..."
                  className="js-search js-dd-focus"
                  value={searchValueFrom}
                  name="searchValueFrom"
                  onChange={(e) => onHandleChange(e, 1)}
                  onClick={(e) => removeState(e, 1)}
                  style={{ cursor: "pointer" }}
                />
                <div className="shadow-2 dropdown-menu min-width-400">
                  <div className="bg-white px-20 py-20 sm:px-0 sm:py-15 rounded-4">
                    <ul className="y-gap-5 js-results">
                      {locationSearchContent.length > 0 ? (
                        locationSearchContent.map((item) => (
                          <li
                            className={`-link d-block col-12 text-left rounded-4 px-20 py-15 js-search-option mb-1 ${selectedItemFrom &&
                              selectedItemFrom.id === item.id
                              ? "active"
                              : ""
                              }`}
                            key={item?._id}
                            role="button"
                            onClick={() => handleOptionClick(item, 1)}
                          >
                            <div className="d-flex">
                              <div className="icon-location-2 text-light-1 text-20 pt-4" />
                              <div className="ml-10">
                                <div className="text-15 lh-12 fw-500 js-search-option-target">
                                  {`${item?.name}, ${item?.city}  (${item?.code})`}
                                </div>
                                <div className="text-14 lh-12 text-light-1 mt-5">
                                  {item?.country}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <div className="d-flex">
                          <div className="icon-location-2 text-light-1 text-20 pt-4" />
                          <div className="ml-10">
                            <div className="text-14 lh-12 text-light-1 mt-5">
                              No airport in {searchValueFrom}
                            </div>
                          </div>
                        </div>
                      )}
                    </ul>
                  </div>
                </div>
                <br />
                {flightFrom}
                <br />
                <span style={{ color: "#dc3545" }}>{error.from}</span>
              </div>
            </div>
          </div>
          <div className="h-full searchMenu-loc px-12 lg:py-20 lg:px-0 js-form-dd js-liverSearch">
            <h4 className="text-15 fw-500 ls-2 lh-16">Flying To</h4>
            <div
              data-bs-toggle="dropdown"
              data-bs-auto-close="true"
              data-bs-offset="0,22"
              style={{ cursor: "pointer" }}
            >
              <div className="text-15 text-light-1 ls-2 lh-16">
                <input
                  tabIndex="-1"
                  autoComplete="off"
                  type="search"
                  placeholder="To Where..."
                  className="js-search js-dd-focus"
                  value={searchValueTo}
                  name="searchValueTo"
                  // onChange={(e) => setSearchValue(e.target.value)}
                  onClick={(e) => removeState(e, 2)}
                  onChange={(e) => onHandleChange(e, 2)}
                  style={{ cursor: "pointer" }}
                />
                <div className="shadow-2 dropdown-menu min-width-400">
                  <div className="bg-white px-20 py-20 sm:px-0 sm:py-15 rounded-4">
                    <ul className="y-gap-5 js-results">
                      {locationSearchContent.length > 0 ? (
                        locationSearchContent.map((item) => (
                          <li
                            className={`-link d-block col-12 text-left rounded-4 px-20 py-15 js-search-option mb-1 ${selectedItemTo && selectedItemTo._id === item._id
                              ? "active"
                              : ""
                              }`}
                            key={item?._id}
                            role="button"
                            onClick={() => handleOptionClick(item, 2)}
                          >
                            <div className="d-flex">
                              <div className="icon-location-2 text-light-1 text-20 pt-4" />
                              <div className="ml-10">
                                <div className="text-15 lh-12 fw-500 js-search-option-target">
                                  {`${item?.name}, ${item?.city}  (${item?.code})`}
                                </div>
                                <div className="text-14 lh-12 text-light-1 mt-5">
                                  {item?.country}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <div className="d-flex">
                          <div className="icon-location-2 text-light-1 text-20 pt-4" />
                          <div className="ml-10">
                            <div className="text-14 lh-12 text-light-1 mt-5">
                              No airport in {searchValueTo}
                            </div>
                          </div>
                        </div>
                      )}
                    </ul>
                  </div>
                </div>
                <br />
                {flightTo}
                <br />
                <span style={{ color: "#dc3545" }}>{error.to}</span>
              </div>
            </div>
          </div>

          <div className="h-full searchMenu-date px-18 lg:py-20 lg:px-0 js-form-dd js-calendar">
            {/* <div> */}
            <h4 className="text-15 fw-500 ls-2 lh-16">Depart</h4>
            <div className="text-15 text-light-1 ls-2 lh-16 custom_dual_datepicker">
              <DatePicker
                tabIndex="-1"
                autoComplete="off"
                placeholderText={moment().format("DD MMMM YYYY")}
                showIcon
                inputClass="custom_input-picker"
                containerClassName="custom_container-picker"
                // multiple={false}
                selected={datesFrom}
                name="datesFrom"
                //onChange={(date) => {setDatesFrom(date),setTodayDayFrom(moment(date).format("dddd")),setDatesTo(date),setTodayDayTo(moment(date).format("dddd"))}}
                onChange={(date) => {
                  toDateFun(date);
                }}
                dateFormat="dd MMMM yyyy"
                minDate={new Date()}
                maxDate={moment().add(6, "months").toDate()}
                className="custom-datepicker"
              />
              <br />
              {todayDayFrom}
            </div>
          </div>

          <div className="h-full searchMenu-date px-18 lg:py-20 lg:px-0 js-form-dd js-calendar">
            <div>
              <h4 className="text-15 fw-500 ls-2 lh-16">
                Return{" "}
                {selectedTrip && (
                  <button
                    className="buttonSmall"
                    onClick={handleTripChange}
                    value="1"
                    tabIndex="-1"
                    style={{ color: "red" }}
                  >
                    X
                  </button>
                )}
              </h4>
              <div className="text-15 text-light-1 ls-2  h-full  custom_dual_datepicker">
                {addReturnDate ? (
                  <>
                    <DatePicker
                      tabIndex="-1"
                      autoComplete="off"
                      placeholderText={moment().format("DD MMMM YYYY")}
                      showIcon
                      inputClass="custom_input-picker"
                      containerClassName="custom_container-picker"
                      // multiple={false}
                      selected={datesTo}
                      name="datesFrom"
                      onChange={(date) => {
                        setDatesTo(date),
                          setTodayDayTo(moment(date).format("dddd"));
                      }}
                      dateFormat="dd MMMM yyyy"
                      minDate={datesFrom ? new Date(datesFrom) : new Date()}
                      maxDate={moment().add(6, "months").toDate()}
                      className="custom-datepicker"
                    />
                    <br />
                    {todayDayTo}
                  </>
                ) : (
                  <button
                    className="buttonSmall h-full"
                    onClick={() => {
                      setDatesTo(datesFrom),
                        setAddReturnDate(true),
                        setSelectedTrip(true),
                        setTodayDayTo(moment(datesFrom).format("dddd"));
                    }}
                  >
                    + Add Return
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="h-full searchMenu-guests px-24 lg:py-20 lg:px-0 js-form-dd js-form-counters">
            <div
              data-bs-toggle="dropdown"
              data-bs-auto-close="outside"
              aria-expanded="false"
              data-bs-offset="0,22"
              style={{ cursor: "pointer" }}
            >
              <h4 className="text-15 fw-500 ls-2 lh-16">Travellers</h4>
              <div className="text-15 text-light-1 ls-2 lh-16">
                <span className="js-count-adult">{guestCounts.Adults}</span>{" "}
                Adults -{" "}
                <span className="js-count-child">{guestCounts.Children}</span>{" "}
                Childrens -{" "}
                <span className="js-count-child">{guestCounts.Infants}</span>{" "}
                Infants
                <>
                  <br />
                  <span className="js-count-child">
                    {selectedClass == "ECONOMY"
                      ? "Economy"
                      : selectedClass == "PREMIUM_ECONOMY"
                        ? "Premium"
                        : selectedClass == "FIRST"
                          ? "First"
                          : "Business"}
                  </span>{" "}
                  Class
                  <br />
                  {/* <span style={{color:'#dc3545'}}>{passengerError}</span> */}
                </>
              </div>
            </div>

            <div className="shadow-2 dropdown-menu min-width-390">
              <div className="bg-white px-30 py-30 rounded-4 counter-box">
                <h5>Passengers</h5>
                {counters.map((counter) => (
                  <Counter
                    key={counter.name}
                    name={counter.name}
                    defaultValue={counter.defaultValue}
                    onCounterChange={handleCounterChange}
                    allCount={guestCounts}
                    showError={showError}
                  />
                ))}
              </div>
              {props?.totalFlightCount == 1 ? null : (
                <div className="bg-white px-30 py-30 rounded-4 counter-box">
                  <h5>Class</h5>
                  <div className="border-top-light mt-18 mb-18" />
                  <label
                    className="radio-box"
                    style={{
                      cursor: "pointer",
                      display: "block",
                    }}
                  >
                    <input
                      tabIndex="-1"
                      type="radio"
                      value="ECONOMY"
                      checked={selectedClass == "ECONOMY"}
                      onChange={handleClassChange}
                    />
                    Economy
                  </label>
                  <label
                    className="radio-box"
                    style={{
                      cursor: "pointer",
                      display: "block",
                    }}
                  >
                    <input
                      tabIndex="-1"
                      type="radio"
                      value="PREMIUM_ECONOMY"
                      checked={selectedClass == "PREMIUM_ECONOMY"}
                      onChange={handleClassChange}
                    />
                    Premium
                  </label>
                  <label
                    className="radio-box"
                    style={{
                      cursor: "pointer",
                      display: "block",
                    }}
                  >
                    <input
                      tabIndex="-1"
                      type="radio"
                      value="BUSINESS"
                      checked={selectedClass == "BUSINESS"}
                      onChange={handleClassChange}
                    />
                    Business
                  </label>
                  <label
                    className="radio-box"
                    style={{
                      cursor: "pointer",
                      display: "block",
                    }}
                  >
                    <input
                      tabIndex="-1"
                      type="radio"
                      value="FIRST"
                      checked={selectedClass == "FIRST"}
                      onChange={handleClassChange}
                    />
                    First
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="button-item">
            <button
              tabIndex="-1"
              type="submit"
              className="mainSearch__submit button -blue-1 py-15 px-35 h-60 col-12 rounded-5 bg-dark-1 text-white"
              onClick={() => onSubmit(1)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner></Spinner>&nbsp;Loading...
                </>
              ) : (
                <>
                  {router.pathname == "/" ? (
                    <>Search&nbsp;</>
                  ) : (
                    <>Modify Search&nbsp;</>
                  )}{" "}
                  <div className="icon-search text-20 mr-10" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainFilterSearchBox;
