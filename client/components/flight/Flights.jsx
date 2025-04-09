import Image from "next/image";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import flightsData from "../../data/flights";
import { useEffect, useState } from "react";
import { request } from "../../api/Api";
import { Spinner } from "reactstrap";
import moment from "moment";
import axios from "axios";
import { BASE_URL } from "../../config";
import { useDispatch, useSelector } from "react-redux";
import { FlightSuccess, FlightState } from "../../features/FlightSearchSlice";
import { AddAirlines } from "../../features/SidebarSlice";
import { PriceChange } from "../../features/MaxPriceSlice";
import Loader from "../../pages/flight/Loader";

const Flights = (props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  let currencyData = useSelector((state) => state?.CurrencySlice?.currencyData);
  const [data, setData] = useState([]);
  const [logo, setLogo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiportName, setAiportName] = useState([]);
  const [loading, setLoading] = useState(false);

  async function getAirport(key) {
    const config = {
      headers: { "Content-Type": "application/json"},
    }
    if(key!==undefined && key!==''){//console.log(getCode);
      axios.get(`${BASE_URL}flight/airports?code=${key}`,config).
      then((res)=>{
        setAiportName((aiportName) => [
          ...aiportName,
          { key, name: res?.data?.ResponseBody?.docs[0]?.name }])
      }).
      catch((err)=>{
        //console.log(err)
      });
    }
  
  }

  const getData = async (props) => {
    const promise = await request("flight/getRecommendedFlights", {}, "get");
    if (promise.error) {
      setIsLoading(false);
    } else {
      setData(promise.response.result);
      promise.response.result.map((item) => {
        const config = {
          headers: { "Content-Type": "application/json" },
        };
        //to get airports name
        getAirport(item.itineraries[0].segments[0].departure.iataCode);
        getAirport(item.itineraries[0].segments[0].arrival.iataCode);
        //to get airports name
        //to get airline logo
        if (
          item.validatingAirlineCodes !== undefined &&
          item.validatingAirlineCodes !== ""
        ) {
          axios
            .get(
              `${BASE_URL}flight/airlines?code=${item.validatingAirlineCodes}`,
              config
            )
            .then((res) => {
              setLogo((logo) => [...logo, res?.data?.ResponseBody[0]?.logo]);
              //console.log(res.data.ResponseBody[0].logo);
              // setAiportName((aiportName) => [
              //   ...aiportName,
              //   { key, index:index, name: res?.data?.ResponseBody?.docs[0]?.name }])
            })
            .catch((err) => {
              //console.log(err)
            });
        }
        //to get airline logo
      });
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getData();
  }, []);
  const TimeDifference = (duration) => {
    const str = duration;
    const hoursMatch = str.match(/(\d+)H/);
    const minutesMatch = str.match(/(\d+)M/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return `${hours}h ${minutes}m`;
  };
  const callApi = async (item) => {
    setLoading(true);
    const result1 = aiportName.find(data => data.key === item.itineraries[0].segments[0].departure.iataCode);
    const result2 = aiportName.find(data => data.key === item.itineraries[0].segments[0].arrival.iataCode);
    
    
    
    const promiseToken = await request(
      `flight/flight-offers?originLocationCode=${item?.itineraries[0]?.segments[0]?.departure?.iataCode}&destinationLocationCode=${item?.itineraries[0]?.segments[0]?.arrival?.iataCode}&departureDate=${moment(item?.itineraries[0]?.segments[0]?.departure?.at).format("YYYY-MM-DD")}&returnDate=${moment(item?.itineraries[0]?.segments[0]?.arrival?.at).format("YYYY-MM-DD")}&adults=1&children=0&infants=0&currencyCode=${currencyData?.currency}&max=100`,
      {},
      "get"
    );
    if (promiseToken.error) {
      setLoading(false);
    } else {
      setLoading(false);
      //setFlightData(promiseToken.response.ResponseBody);

      dispatch(AddAirlines(promiseToken?.response?.ResponseBody?.dictionaries?.carriers));
      const maxPrice = promiseToken?.response?.ResponseBody.data?.reduce((max, b) => Math.max(max, b.price.grandTotal), promiseToken?.response?.ResponseBody?.data[0]?.price?.grandTotal);
      dispatch(PriceChange(maxPrice));

      dispatch(FlightSuccess(promiseToken?.response?.ResponseBody));
      dispatch(FlightState({
        searchValueFrom:result1?.name,
        searchValueTo:result2?.name,
        flightFrom:item?.itineraries[0]?.segments[0]?.departure?.iataCode,
        flightTo:item?.itineraries[0]?.segments[0]?.arrival?.iataCode,
        //datesFrom:moment(item?.itineraries[0]?.segments[0]?.departure?.at).format("YYYY-MM-DD"),
        //datesTo:moment(item?.itineraries[0]?.segments[0]?.arrival?.at).format("YYYY-MM-DD"),
        datesFrom:new Date(item?.itineraries[0]?.segments[0]?.departure?.at),
        datesTo:new Date(item?.itineraries[0]?.segments[0]?.arrival?.at),
        addReturnDate:true,
        selectedClass:'ECONOMY',selectedTrip:true
      }));
      router.push({pathname: "/flight"});
    }
    // dispatch(FlightState({
    //   searchValueFrom:result1?.name,
    //   searchValueTo:result2.name,
    //   flightFrom:item.itineraries[0].segments[0].departure.iataCode,
    //   flightTo:item.itineraries[0].segments[0].arrival.iataCode,
    //   datesFrom:item.itineraries[0].segments[0].departure.at,
    //   datesTo:item.itineraries[0].segments[0].arrival.at,
    //   addReturnDate:item.itineraries[1].segments[0].arrival.at
    // }));
    // dispatch(FlightStatus(true));
  }
  return (
    <>
      {isLoading ? (
        <div className="px-20 py-20 rounded-4 border-light">
          <div className="row y-gap-30 justify-between xl:justify-">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Spinner
                color="primary"
                style={{ height: "3rem", width: "3rem" }}
                type="grow"
              >
                Loading...
              </Spinner>
            </div>
          </div>
        </div>
      ) : (
        loading?
          <div className="px-20 py-20 rounded-4 border-light">
          <div className="row y-gap-30 justify-between xl:justify-">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Loader />
            </div>
          </div>
        </div>:
        data.map((flighData, index) => (
          <div
            className="col-12"
            key={flighData?.id}
            data-aos="fade"
            data-aos-delay={item?.delayAnimation}
          >
            <div className="px-20 py-20 rounded-4 border-light">
              <div className="row y-gap-30 justify-between xl:justify-">
                {flighData?.itineraries?.map((flight, index1) =>
                  flight?.segments?.map((item) => (
                    <div className="col-xl-4 col-lg-6" key={item?.id}>
                      <div className="row y-gap-10 items-center">
                        <div className="col-sm-auto">
                          <img
                            width={40}
                            height={40}
                            className="size-40"
                            src={logo[index]}
                            alt="image"
                          />
                        </div>
                        <div className="col">
                          <div className="row x-gap-20 items-end">
                            <div className="col-auto">
                              <div className="lh-15 fw-500">
                                {moment(item?.departure?.at).format("h:mm  a")}
                              </div>
                              <div className="text-15 lh-15 text-light-1">
                                {item?.departure?.iataCode}
                              </div>
                            </div>
                            <div className="col text-center">
                              <div className="text-15 lh-15 text-light-1 mb-10">
                                {TimeDifference(
                                  item?.duration
                                )}
                              </div>
                              <div className="flightLine">
                                <div />
                                <div />
                              </div>
                              <div className="text-15 lh-15 text-light-1 mt-10">
                                Nonstop
                              </div>
                            </div>
                            <div className="col-auto">
                              <div className="lh-15 fw-500">
                                {moment(item?.arrival?.at).format("h:mm  a")}
                              </div>
                              <div className="text-15 lh-15 text-light-1">
                                {item?.arrival?.iataCode}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="col-auto">
                  <div className="d-flex items-center">
                    <div className="text-right mr-24">
                      <div className="lh-15 fw-500">
                        {flighData?.price?.currency} {flighData?.price?.total}
                      </div>
                      {/* <div className="text-15 lh-15 text-light-1">
                      {flighData?.deals} deals
                    </div> */}
                    </div>
                    <button
                      onClick={()=>callApi(flighData)}
                      className="button -outline-blue-1 px-30 h-50 text-blue-1"
                    >
                      View Deal <div className="icon-arrow-top-right ml-15" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default Flights;
