import Image from "next/image";
import Link from "next/link";
import flightsData from "../../../data/flights";
import moment from "moment";
import { Alert } from "reactstrap";
import { useEffect, useState } from "react";
import { requestToken } from "../../../api/Api";
import { TabPane } from "reactstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Flights = (props) => {
  //console.log("ander", props.logo);
  const [aiportName, setAiportName] = useState([]);
  const [aiportReturnName, setAiportReturnName] = useState([]);

  const TimeDifference = (duration) => {
    const str = duration;
    const hoursMatch = str.match(/(\d+)H/);
    const minutesMatch = str.match(/(\d+)M/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return `${hours}h ${minutes}m`;
  };
  const TimeDifferenceLayOver = (start, end) => {
    const departureTime = new Date(start);
    const arrivalTime = new Date(end);
    const timeDifference = arrivalTime - departureTime;
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesDifference = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );

    let time = `${hoursDifference}h ${minutesDifference}m`;
    return time;
  };

  const getData = async () => {
    let promise = "";
    for (let i = 0; i < props.data.length; i++) {
      promise = await requestToken(
        `flight/airports?code=${props.data[i].departure.iataCode}`,
        {},
        "get"
      );
      if (promise.error) {
        toast.error("Somrthing went wrong. Please try again later");
      } else {
        for (let j = 0; j < promise.response.ResponseBody.docs.length; j++) {
          if (
            promise.response.ResponseBody.docs[j].code ==
            props.data[i].departure.iataCode
          ) {
            setAiportName((prevAiportName) => [
              ...prevAiportName,
              {
                name: promise.response.ResponseBody.docs[j].name,
                code: promise.response.ResponseBody.docs[j].code,
                country: promise.response.ResponseBody.docs[j].country,
              },
            ]);
          }
        }
      }
      if (i == props.data.length - 1) {
        promise = await requestToken(
          `flight/airports?code=${props.data[i].arrival.iataCode}`,
          {},
          "get"
        );
        if (promise.error) {
          //toast.error(promise.error.response.data.ResponseMessage);
        } else {
          for (let j = 0; j < promise.response.ResponseBody.docs.length; j++) {
            if (
              promise.response.ResponseBody.docs[j].code ==
              props.data[i].arrival.iataCode
            ) {
              setAiportName((prevAiportName) => [
                ...prevAiportName,
                {
                  name: promise.response.ResponseBody.docs[j].name,
                  code: promise.response.ResponseBody.docs[j].code,
                  country: promise.response.ResponseBody.docs[j].country,
                },
              ]);
            }
          }
        }
      }
    }
  };

  const getReturnData = async () => {
    let promise = "";
    for (let i = 0; i < props.returnData.length; i++) {
      promise = await requestToken(
        `flight/airports?code=${props.returnData[i].departure.iataCode}`,
        {},
        "get"
      );
      if (promise.error) {
        //toast.error(promise.error.response.data.ResponseMessage);
      } else {
        for (let j = 0; j < promise.response.ResponseBody.docs.length; j++) {
          if (
            promise.response.ResponseBody.docs[j].code ==
            props.returnData[i].departure.iataCode
          ) {
            setAiportReturnName((prevAiportReturnName) => [
              ...prevAiportReturnName,
              {
                name: promise.response.ResponseBody.docs[j].name,
                code: promise.response.ResponseBody.docs[j].code,
                country: promise.response.ResponseBody.docs[j].country,
              },
            ]);
          }
        }
      }
      if (i == props.returnData.length - 1) {
        promise = await requestToken(
          `flight/airports?code=${props.returnData[i].arrival.iataCode}`,
          {},
          "get"
        );
        if (promise.error) {
          //toast.error(promise.error.response.data.ResponseMessage);
        } else {
          for (let j = 0; j < promise.response.ResponseBody.docs.length; j++) {
            if (
              promise.response.ResponseBody.docs[j].code ==
              props.returnData[i].arrival.iataCode
            ) {
              setAiportReturnName((prevAiportReturnName) => [
                ...prevAiportReturnName,
                {
                  name: promise.response.ResponseBody.docs[j].name,
                  code: promise.response.ResponseBody.docs[j].code,
                  country: promise.response.ResponseBody.docs[j].country,
                },
              ]);
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);
  useEffect(() => {
    if (props?.returnData) {
      getReturnData();
    }
  }, []);

  const getAirport = (code) => {
    if (aiportName.findIndex((airport) => airport.code == code) >= 0) {
      return aiportName[aiportName.findIndex((airport) => airport.code == code)]
        .name;
    }
  };
  const getReturnAirport = (code) => {
    if (aiportReturnName.findIndex((airport) => airport.code == code) >= 0) {
      return aiportReturnName[
        aiportReturnName.findIndex((airport) => airport.code == code)
      ].name;
    }
  };

  const findLogo = (key) => {
    let data = props.logo.filter((element) => element.key === key);
    //console.log(data[0]?.logo);
    if (data[0]?.logo) {
      return data[0]?.logo;
    }
  };

  const findReturnLogo = (key) => {
    let data = props.logo.filter((element) => element.key === key);
    //console.log(data[0]?.logo);
    if (data[0]?.logo) {
      return data[0]?.logo;
    }
  };

  function isValidURL(url) {
    var urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
  }

  return (
    <>
      <TabPane tabId="1">
        {" "}
        <h5 className="sectionTitle__title">Flight Details</h5>
        {props.data.map((flight, index) => (
          <>
            <div
              className="px-10 py-10 mb-3 rounded-4 border-light"
              key={index}
            >
              <div className="row y-gap-10 items-center">
                <div className="col-sm-auto">
                  {isValidURL(findLogo(flight.carrierCode)) ? (
                    <img
                      className="size-40"
                      src={findLogo(flight.carrierCode)}
                      alt="image"
                      style={{ borderRadius: "50%" }}
                    />
                  ) : (
                    <Skeleton circle height={"40px"} width={"40px"} />
                  )}
                  <div className="text-12 lh-15 text-light-1">
                    {props.carrier[flight?.carrierCode]}
                  </div>
                  <div className="text-12 lh-15 text-light-1">{`${flight.carrierCode} - ${flight.number}`}</div>
                </div>
                <div className="col">
                  <div className="row x-gap-10 items-end">
                    <div className="col-auto">
                      <div className="text-12 lh-15 fw-500">
                        {flight.departure.iataCode}
                      </div>
                      <div className="lh-15 fw-500">
                        {moment(flight?.departure?.at).format("h:mm a")}
                      </div>
                      <div className="lh-15 fw-500">
                        {moment(flight?.departure?.at).format("MMMM Do YYYY")}
                      </div>
                      <div className="text-12 lh-15 fw-500">
                        (T
                        {flight.departure.terminal
                          ? flight.departure.terminal
                          : 0}
                        ) {getAirport(flight.departure.iataCode)}
                      </div>
                    </div>
                    <div className="col text-center">
                      <div className="flightLine">
                        <div />
                        <div />
                      </div>
                      <div className="text-12 lh-15 text-light-1 mt-10">
                        {TimeDifference(flight?.duration)}
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="text-12lh-15 fw-500">
                        {flight.arrival.iataCode}
                      </div>
                      <div className="lh-15 fw-500">
                        {moment(flight?.arrival?.at).format("h:mm a")}
                      </div>
                      <div className="lh-15 fw-500">
                        {moment(flight?.arrival?.at).format("MMMM Do YYYY")}
                      </div>
                      <div className="text-12 lh-15 fw-500">
                        (T
                        {flight.arrival.terminal ? flight.arrival.terminal : 0}){" "}
                        {getAirport(flight.arrival.iataCode)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {index < props.data.length - 1 && (
              <Alert color="warning">
                {TimeDifferenceLayOver(
                  props.data[index].arrival.at,
                  props.data[index + 1].departure.at
                )}{" "}
                layover in {getAirport(flight.arrival.iataCode)}
              </Alert>
            )}
          </>
        ))}
      </TabPane>
      {props?.returnData && (
        <>
          <TabPane tabId="2">
            <h5 className="sectionTitle__title">Return Flight Details</h5>
            {props.returnData.map((flight, index) => (
              <>
                <div
                  className="px-10 py-10 mb-3 rounded-4 border-light"
                  key={index}
                >
                  <div className="row y-gap-10 items-center">
                    <div className="col-sm-auto">
                      <img
                        className="size-40"
                        src={findReturnLogo(flight.carrierCode)}
                        alt="image"
                        style={{ borderRadius: "50%" }}
                      />
                      <div className="text-12 lh-15 text-light-1">
                        {props.carrier[flight?.carrierCode]}
                      </div>
                      <div className="text-12 lh-15 text-light-1">{`${flight.carrierCode} - ${flight.number}`}</div>
                    </div>
                    <div className="col">
                      <div className="row x-gap-10 items-end">
                        <div className="col-auto">
                          <div className="text-12 lh-15 fw-500">
                            {flight.departure.iataCode}
                          </div>
                          <div className="lh-15 fw-500">
                            {moment(flight?.departure?.at).format("h:mm a")}
                          </div>
                          <div className="lh-15 fw-500">
                            {moment(flight?.departure?.at).format(
                              "MMMM Do YYYY"
                            )}
                          </div>
                          <div className="text-12 lh-15 fw-500">
                            (T
                            {flight.departure.terminal
                              ? flight.departure.terminal
                              : 0}
                            ) {getAirport(flight.departure.iataCode)}
                          </div>
                        </div>
                        <div className="col text-center">
                          <div className="flightLine">
                            <div />
                            <div />
                          </div>
                          <div className="text-12 lh-15 text-light-1 mt-10">
                            {TimeDifference(flight?.duration)}
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="text-12 lh-15 fw-500">
                            {flight.arrival.iataCode}
                          </div>
                          <div className="lh-15 fw-500">
                            {moment(flight?.arrival?.at).format("h:mm a")}
                          </div>
                          <div className="lh-15 fw-500">
                            {moment(flight?.arrival?.at).format("MMMM Do YYYY")}
                          </div>
                          <div className="text-12 lh-15 fw-500">
                            (T
                            {flight.arrival.terminal
                              ? flight.arrival.terminal
                              : 0}
                            ) {getReturnAirport(flight.arrival.iataCode)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {index < props.returnData.length - 1 && (
                  <Alert color="warning">
                    {TimeDifferenceLayOver(
                      props.returnData[index].arrival.at,
                      props.returnData[index + 1].departure.at
                    )}{" "}
                    layover in {getReturnAirport(flight.arrival.iataCode)}
                  </Alert>
                )}
              </>
            ))}
          </TabPane>
        </>
      )}
    </>
  );
};

export default Flights;
