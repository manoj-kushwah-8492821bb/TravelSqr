//import Stops from "../sidebar/Stops";
import { useEffect } from "react";
//import Airlines from "../sidebar/Airlines";
//import Alliance from "../sidebar/Alliance";
//import DepartingFrom from "../sidebar/DepartingFrom";
//import PirceSlider from "../sidebar/PirceSlider";
//import ArrivingAt from "../sidebar/ArrivingAt";
//import Cabin from "../sidebar/Cabin";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import InputRange from "react-input-range";
import { ApiPriceChange } from "../../../features/MaxPriceSlice";

const Sidebar = (props) => {
  const dispatch = useDispatch();
  let airLineList = useSelector((state) => state?.SidebarData?.airlines);
  let searchResult = useSelector((state) => state.flightSearch);
  let maxPriceRedux = useSelector((state) => state?.MaxPriceSlice?.max?.price);
  let currencyData = useSelector((state) => state?.CurrencySlice?.currencyData);
  const [stopShow, setStopShow] = useState({
    Nonstop: false,
    Stop1: false,
    Stop2: false,
  });
  const [flagStatus, setFlagStatus] = useState(1);
  const [status, setStatus] = useState(true);
  const [stopSearch, setStopSearch] = useState(null);
  const [cabinCheck, setCabinCheck] = useState(props.selectCabin || "ECONOMY");
  const [price, setPrice] = useState({
    value: { min: 0, max: maxPriceRedux },
  });

  const add = (e) => {
    props.airLineClick(e);
    setFlagStatus(2);
  };
  const addStop = (e) => {
    props.stopClick(e);
  };
  const addCabin = (e) => {
    setCabinCheck(e.target.value);
    props.cabinClick(e);
    setFlagStatus(2);
  };

  const handleOnChange = (value) => {
    setPrice({ value: { min: 0, max: value.max } });
  };
  const handleOnFinalChange = (value) => {
    props.priceClick(value.max);
    dispatch(ApiPriceChange(value.max));
    setFlagStatus(2);
  };

  useEffect(() => {
    if (!props.countResult || props?.countResult == 0) {
      setStatus(true);
    } else {
      setStatus(false);
    }
  }, [props.countResult]);

  // useEffect(()=>{
  //   setCabinCheck(props.selectCabin)
  // },[props.selectCabin]);

  useEffect(() => {
    setPrice({
      value: {
        min: 0,
        max: maxPriceRedux,
      },
    });
  }, [maxPriceRedux]);

  useEffect(() => {
    setFlagStatus(props?.flagStatus);
  }, [props?.flagStatus]);

  function capitalizeFLetter(string) {
    // Check if string is null or blank
    if (!string || string.trim() === "") {
      return ""; // or any other default value or handle accordingly
    }

    let lower = string.toLowerCase();
    let arr = lower.split(" ");
    let data = "";

    arr.forEach((element, index) => {
      if (index === 0) {
        data = element[0].toUpperCase() + element.slice(1);
      } else {
        data = data + " " + element[0].toUpperCase() + element.slice(1);
      }
    });

    return data;
  }
  // const handleClassChange = (e) => {
  //   setCabinCheck(e.target.value);
  // };
  useEffect(() => {
    setStopShow((prevStopShow) => {
      let updatedStopShow = { ...prevStopShow };

      const searchArray = searchResult.flightSearch.data;

      searchArray?.forEach((item, index) => {
        item?.itineraries?.forEach((data, index1) => {
          console.log(data.segments.length);
          if (data.segments.length == 1) {
            updatedStopShow = { ...updatedStopShow, Nonstop: true };
          } else if (data.segments.length == 2) {
            updatedStopShow = { ...updatedStopShow, Stop1: true };
          } else if (data.segments.length > 2) {
            updatedStopShow = { ...updatedStopShow, Stop2: true };
          }
        });
      });

      return updatedStopShow;
    });
  }, [searchResult]);
  return (
    <>
      <div className="sidebar__item -no-border">
        <h5 className="text-18 fw-500 mb-10">Stops</h5>
        <div className="sidebar-checkbox">
          {["Nonstop", "1 Stop", "2+ Stop"].map((value, index) => (
            <>
              {value == "Nonstop" && stopShow.Nonstop == true && (
                <div
                  className="row y-gap-10 items-center justify-between"
                  key={index}
                >
                  <div className="col-auto">
                    <div className="form-checkbox d-flex items-center">
                      <input
                        type="checkbox"
                        name="stop"
                        value={index + 1}
                        onClick={addStop}
                        disabled={status}
                      />
                      <div className="form-checkbox__mark">
                        <div className="form-checkbox__icon icon-check" />
                      </div>
                      <div className="text-15 ml-10">{value}</div>
                    </div>
                  </div>
                </div>
              )}
              {value == "1 Stop" && stopShow.Stop1 == true && (
                <div
                  className="row y-gap-10 items-center justify-between"
                  key={index}
                >
                  <div className="col-auto">
                    <div className="form-checkbox d-flex items-center">
                      <input
                        type="checkbox"
                        name="stop"
                        value={index + 1}
                        onClick={addStop}
                        disabled={status}
                      />
                      <div className="form-checkbox__mark">
                        <div className="form-checkbox__icon icon-check" />
                      </div>
                      <div className="text-15 ml-10">{value}</div>
                    </div>
                  </div>
                </div>
              )}
              {value == "2+ Stop" && stopShow.Stop2 == true && (
                <div
                  className="row y-gap-10 items-center justify-between"
                  key={index}
                >
                  <div className="col-auto">
                    <div className="form-checkbox d-flex items-center">
                      <input
                        type="checkbox"
                        name="stop"
                        value={index + 1}
                        onClick={addStop}
                        disabled={status}
                      />
                      <div className="form-checkbox__mark">
                        <div className="form-checkbox__icon icon-check" />
                      </div>
                      <div className="text-15 ml-10">{value}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ))}
        </div>
        {/* End Sidebar-checkbox */}
      </div>
      {/* End popular filter */}

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Class</h5>
        <div className="sidebar-checkbox">
          <div className="row y-gap-10 items-center justify-between">
            <div className="col-auto">
              <label
                className="d-flex items-center"
                style={{ cursor: "pointer" }}
              >
                <input
                  tabindex="-1"
                  type="radio"
                  value="ECONOMY"
                  checked={cabinCheck == "ECONOMY"}
                  onChange={addCabin}
                />
                <div className="text-15 ml-10">Economy</div>
              </label>
            </div>
          </div>
          <div className="row y-gap-10 items-center justify-between">
            <div className="col-auto">
              <label
                className="d-flex items-center"
                style={{ cursor: "pointer" }}
              >
                <input
                  tabindex="-1"
                  type="radio"
                  value="PREMIUM_ECONOMY"
                  checked={cabinCheck == "PREMIUM_ECONOMY"}
                  onChange={addCabin}
                  // onClick={addCabin}
                />
                <div className="text-15 ml-10">Premium</div>
              </label>
            </div>
          </div>
          <div className="row y-gap-10 items-center justify-between">
            <div className="col-auto">
              <label
                className="d-flex items-center"
                style={{ cursor: "pointer" }}
              >
                <input
                  tabindex="-1"
                  type="radio"
                  value="BUSINESS"
                  checked={cabinCheck == "BUSINESS"}
                  onChange={addCabin}
                />
                <div className="text-15 ml-10">Business</div>
              </label>
            </div>
          </div>
          <div className="row y-gap-10 items-center justify-between">
            <div className="col-auto">
              <label
                className="d-flex items-center"
                style={{ cursor: "pointer" }}
              >
                <input
                  tabindex="-1"
                  type="radio"
                  value="FIRST"
                  checked={cabinCheck == "FIRST"}
                  onChange={addCabin}
                />
                <div className="text-15 ml-10">First</div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar__item pb-30">
        <h5 className="text-18 fw-500 mb-10">Price</h5>
        <div className="row x-gap-10 y-gap-30">
          <div className="col-12">
            <div className="js-price-rangeSlider">
              <div className="text-14 fw-500"></div>

              <div className="d-flex justify-between mb-20">
                <div className="text-15 text-dark-1">
                  <span className="js-lower mx-1">
                    {currencyData.symbol}
                    {price.value.min}
                  </span>
                  -
                  <span className="js-upper mx-1">
                    {currencyData.symbol}
                    {isNaN(price.value.max) ? 0 : price.value.max}
                  </span>
                </div>
              </div>

              <div className="px-5">
                <InputRange
                  formatLabel={(value) => ``}
                  minValue={0}
                  maxValue={maxPriceRedux}
                  value={price.value}
                  onChange={(value) => handleOnChange(value)}
                  onChangeComplete={(value) => handleOnFinalChange(value)}
                  // disabled={status}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Nightly priceslider */}

      <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Airlines</h5>
        <div className="sidebar-checkbox">
          {airLineList && Object.keys(airLineList).length > 0 ? (
            airLineList &&
            Object.keys(airLineList).map((key) => (
              <div
                className="row y-gap-10 items-center justify-between"
                key={key}
              >
                <div className="col-auto">
                  <div className="form-checkbox d-flex items-center">
                    {flagStatus == 1 ? (
                      <input
                        type="checkbox"
                        name="name"
                        value={key}
                        onClick={add}
                        checked={false}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        name="name"
                        value={key}
                        onClick={add}
                      />
                    )}
                    <div className="form-checkbox__mark">
                      <div className="form-checkbox__icon icon-check" />
                    </div>
                    <div className="text-15 ml-10">
                      {capitalizeFLetter(airLineList[key])}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No airline found</div>
          )}
          {/* End .row */}
        </div>
      </div>
      {/* End style filter */}

      {/* <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Alliance</h5>
        <div className="sidebar-checkbox">
          <Alliance />
        </div>
      </div> */}
      {/* End CruiseStyle filter */}

      {/* <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Departing from</h5>
        <div className="sidebar-checkbox">
          <DepartingFrom />
        </div>
      </div> */}
      {/* End Port filter */}

      {/* <div className="sidebar__item">
        <h5 className="text-18 fw-500 mb-10">Arriving at</h5>
        <div className="sidebar-checkbox">
          <ArrivingAt />
        </div>
      </div> */}
      {/* End Port filter */}
    </>
  );
};

export default Sidebar;
