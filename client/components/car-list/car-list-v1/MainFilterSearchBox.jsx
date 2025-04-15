import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { request } from "../../../api/Api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import {
  FlightSuccess,
  FlightState,
} from "../../../features/FlightSearchSlice";
import { Spinner } from "reactstrap";

/** Counter start */
const Counter = ({ name, defaultValue, onCounterChange, allCount }) => {
  const [count, setCount] = useState(defaultValue);
  const incrementCount = () => {
    setCount(count + 1);
    onCounterChange(name, count + 1);
  };
  const decrementCount = () => {
    if (count > 0) {
      setCount(count - 1);
      onCounterChange(name, count - 1);
    }
  };

  return (
    <>
      <div className="row y-gap-10 justify-between items-center">
        <div className="col-auto">
          <div className="text-15 lh-12 fw-500">{name}</div>
        </div>
        {/* End .col-auto */}
        <div className="col-auto">
          <div className="d-flex items-center js-counter">
            {name === "Adults" && allCount.Rooms == allCount.Adults ? (
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
            {allCount.Adults + allCount.Children + allCount.Rooms > 8 ? (
              <button
                className="-outline-blue-1 text-blue-1 size-38 rounded-4 js-down"
                disabled={true}
                style={{ backgroundColor: "#F1F3F5" }}
              >
                <i className="icon-plus text-12" />
              </button>
            ) : name === "Rooms" && allCount.Rooms == allCount.Adults ? (
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

  let currencyData = useSelector((state) => state?.CurrencySlice?.currencyData);

  const [loading, setLoading] = useState(false);
  const counters = [
    {
      name: "Passengers",
      defaultValue: searchState.adults == undefined ? 1 : searchState.adults,
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

  const [flightFrom, setFlightFrom] = useState(searchState?.flightFrom);
  const [flightTo, setFlightTo] = useState(searchState.flightTo);
  const [flightToName, setFlightToName] = useState(searchState.flightToName);

  const [address, setAddress] = useState(searchState.flightTo);
  const [datesFrom, setDatesFrom] = useState(searchState.datesFrom);
  const [datesFromE, setDatesFromE] = useState(moment().format("DD MMMM YYYY"));
  const [datesTo, setDatesTo] = useState(searchState.datesTo);
  const [guestCounts, setGuestCounts] = useState({
    Passengers: searchState.adults == undefined ? 1 : searchState.adults,
  });

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

  const cabsSearch = async (
    startLocationCode,
    address,
    flightToName,
    endCountryCode,
    checkInDate,
    passengers = 1
  ) => {
    const promiseToken = await request(
      `transfer/transfer-offers`,
      {
        startLocationCode,
        endAddressLine: address,
        endCityName: flightToName,
        endCountryCode: endCountryCode,
        startDateTime: checkInDate,
        passengers,
      },
      "post"
    );

    if (promiseToken.error) {
      toast.error("Something went wrong. Please try again later.");
      setLoading(false);
    } else {
      if (promiseToken?.response?.succeeded === false) {
        toast.error(promiseToken?.response?.ResponseBody?.detail);
        setLoading(false);
      } else {
        setLoading(false);
        props.setCarData(promiseToken.response.data);
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

  const onSubmit = async (flag = 2) => {
    setLoading(true);

    const fromDateFlight = moment(
      datesFrom === null ? datesFromE : datesFrom
    ).format("YYYY-MM-DDTHH:mm:ss");
    let toDateFlight = "";
    if (datesTo != null) {
      toDateFlight = moment(datesTo).format("YYYY-MM-DDTHH:mm:ss");
    } else if (selectedTrip == true) {
      toDateFlight = moment(datesFrom === null ? datesFromE : datesFrom).format(
        "YYYY-MM-DDTHH:mm:ss"
      );
    }

    dispatch(FlightSuccess({}));

    await cabsSearch(
      flightFrom,
      address,
      selectedItemTo?.city,
      selectedItemTo?.countryCode,
      fromDateFlight,
      guestCounts.Passengers
    );
  };

  const removeState = (e, type) => {
    if (type == 1) {
      setSearchValueFrom("");
      setFlightFrom("");
    } else if (type == 2) {
      setFlightTo("");
    }
    getData();
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (currencyData.status === true) {
      if (router.pathname != "/") {
        onSubmit(1);
      }
    }
  }, [currencyData]);

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

  return (
    <div
      className="mainSearch -col-4 px-20 py-20 lg:px-20 lg:pt-5 lg:pb-20 mt-15 rounded"
      style={{ backgroundColor: "white" }}
    >
      <div
        className={`h-full items-center flPage grid ${router.pathname !== "/"
          ? "grid-cols-[auto_auto_200px_min-content]"
          : ""
          } grid`}
      >
        {/*  Pickup Location */}
        <div
          className="h-full searchMenu-loc location lg:py-20 lg:px-0 js-form-dd js-liverSearch"
          style={{ paddingLeft: "18px" }}
        >
          <h4 className="text-15 fw-500 ls-2 lh-16">Pickup Location</h4>
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
                          className={`-link d-block col-12 text-left rounded-4 px-20 py-15 js-search-option mb-1 ${selectedItemFrom && selectedItemFrom.id === item.id
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

        {/* Check In */}
        <div className="h-full searchMenu-date px-18 lg:py-20 lg:px-0 js-form-dd js-calendar">
          {/* <div> */}
          <h4 className="text-15 fw-500 ls-2 lh-16">Pick-up date</h4>
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

        {/* Drop Off Location */}
        <div className="h-full searchMenu-loc px-12 lg:py-20 lg:px-0 js-form-dd js-liverSearch">
          <h4 className="text-15 fw-500 ls-2 lh-16">Drop Off Location</h4>
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

        {/* Drop Off Address */}
        <div className="h-full searchMenu-loc px-12 lg:py-20 lg:px-0 js-form-dd js-liverSearch">
          <h4 className="text-15 fw-500 ls-2 lh-16">Drop Off Address</h4>
          <div style={{ cursor: "pointer" }}>
            <div className="text-15 text-light-1 ls-2 lh-16">
              <input
                autoComplete="off"
                type="input"
                placeholder="Address..."
                value={address}
                name="address"
                onChange={(e) => setAddress(e.target.value)}
                style={{ cursor: "pointer" }}
              />

              <br />
              <br />
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="h-full searchMenu-guests px-24 lg:py-20 lg:px-0 js-form-dd js-form-counters">
          <div
            data-bs-toggle="dropdown"
            data-bs-auto-close="outside"
            aria-expanded="false"
            data-bs-offset="0,22"
            style={{ cursor: "pointer" }}
          >
            <h4 className="text-15 fw-500 ls-2 lh-16">Passangers</h4>
            <div className="text-15 text-light-1 ls-2 lh-16">
              <span className="js-count-adult">{guestCounts.Passengers}</span>{" "}
              Passengers
            </div>
          </div>

          <div className="shadow-2 dropdown-menu min-width-390">
            <div className="bg-white px-30 py-30 rounded-4 counter-box">
              {counters.map((counter) => (
                <Counter
                  key={counter.name}
                  name={counter.name}
                  defaultValue={counter.defaultValue}
                  onCounterChange={handleCounterChange}
                  allCount={guestCounts}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
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
                Search&nbsp; <div className="icon-search text-20 mr-10" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainFilterSearchBox;
