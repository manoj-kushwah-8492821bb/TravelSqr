import moment from "moment";
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Table,
  Alert,
} from "reactstrap";
import axios from "axios";
import { BASE_URL } from "../../../../config";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Details = (props) => {
  const { data } = props;
  // console.log("data", data?.booking_data?.flightOffers[0]?.itineraries[0]);

  const [logo, setLogo] = useState([]);
  const [aiportName, setAiportName] = useState([]);
  const [userData, setUserData] = useState({});

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

  const findLogo = (key) => {
    let data = logo.filter((element) => element.key === key);
    //console.log(data[0]?.logo);
    if (data[0]?.logo) {
      return data[0]?.logo;
    }
  };
  const findName = (key) => {
    let data = logo.filter((element) => element.key === key);
    //console.log(data[0]?.logo);
    if (data[0]?.name) {
      return data[0]?.name;
    }
  };
  const findAir = (key) => {
    let data = aiportName.filter((element) => element.key === key);
    //console.log(data[0]?.logo);
    if (data[0]?.name) {
      return data[0]?.name;
    }
  };

  const TimeDifference = (duration) => {
    const str = duration;
    const hoursMatch = str.match(/(\d+)H/);
    const minutesMatch = str.match(/(\d+)M/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return `${hours}h ${minutes}m`;
  };

  const getLogo = async () => {
    const arr = [
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[0]
        ?.carrierCode,
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[1]
        ?.carrierCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[0]
        ?.carrierCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[1]
        ?.carrierCode,
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[2]
        ?.carrierCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[2]
        ?.carrierCode,
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[3]
        ?.carrierCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[3]
        ?.carrierCode,
    ];
    const newArray = Array.from(new Set(arr.filter(item => item !== undefined)));
    const config = {
      headers: { "Content-Type": "application/json" },
    };
    newArray.map((item) => {
      if (item !== undefined && item !== "") {
        axios
          .get(`${BASE_URL}flight/airlines?code=${item}`, config)
          .then((res) => {
            setLogo((prevLogo) => [
              ...prevLogo,
              {
                key: item,
                logo: res?.data?.ResponseBody[0]?.logo,
                name: res?.data?.ResponseBody[0]?.name,
              },
            ]);
          })
          .catch((err) => {
            //console.log(err)
          });
      }
    });
  };

  const getAirport = async () => {
    const arr = [
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[0]
        ?.departure.iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[1]
        ?.departure.iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[2]
        ?.departure.iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[3]
        ?.departure.iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[0]
        ?.departure.iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[1]
        ?.departure.iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[2]
        ?.departure.iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[3]
        ?.departure.iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[0]?.arrival
        .iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[1]?.arrival
        .iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[2]?.arrival
        .iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[3]?.arrival
        .iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[0]?.arrival
        .iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[1]?.arrival
        .iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[2]?.arrival
        .iataCode,
      data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments[3]?.arrival
        .iataCode,
    ];
    const newArray = Array.from(new Set(arr.filter(item => item !== undefined)));
    const config = {
      headers: { "Content-Type": "application/json" },
    };
    newArray.map((item) => {
      if (item !== undefined && item !== "") {
        //console.log(getCode);
        axios
          .get(`${BASE_URL}flight/airports?code=${item}`, config)
          .then((res) => {
            //console.log(res?.data?.ResponseBody?.docs[0]?.name)
            setAiportName((aiportName) => [
              ...aiportName,
              { key: item, name: res?.data?.ResponseBody?.docs[0]?.name },
            ]);
          })
          .catch((err) => {
            //console.log(err)
          });
      }
    });
  };

  const getUser = async () => {
    console.log(localStorage.getItem("userToken"));
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    };
    axios
      .get(`${BASE_URL}user/auth`, config)
      .then((res) => {
        console.log(res);
        setUserData(res?.data?.ResponseBody);
      })
      .catch((err) => {
        //console.log(err)
      });
  };
  function isValidURL(url) {
    var urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
  }

  useEffect(() => {
    getUser();
    getLogo();
    getAirport();
  }, []);

  return (
    <>
      {JSON.stringify(
        data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[0]
          .duration
      )}
      {data?.booking_data?.flightOffers[0]?.itineraries[0] && (
        <div className="col" style={{ borderLeft: "1px solid #ddd" }}>
          {data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments?.map(
            (flight, index) => (
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
                        {findName(flight.carrierCode)}
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
                            ) {findAir(flight.departure.iataCode)}
                          </div>
                        </div>
                        <div className="col text-center">
                          <div className="flightLine">
                            <div />
                            <div />
                          </div>
                          <div className="text-12 lh-15 text-light-1 mt-10">
                            {TimeDifference(flight.duration)}
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
                            {flight.arrival.terminal
                              ? flight.arrival.terminal
                              : 0}
                            ) {findAir(flight.arrival.iataCode)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* {index < props.data.length - 1 && (
            <Alert color="warning">
              {TimeDifference(
                props.data[index].arrival.at,
                props.data[index + 1].departure.at
              )}{" "}
              layover in {getAirport(flight.arrival.iataCode)}
            </Alert>
          )} */}
              </>
            )
          )}
        </div>
      )}
      {data?.booking_data?.flightOffers[0]?.itineraries[1] && (
        <div className="col" style={{ borderLeft: "1px solid #ddd" }}>
          Return Flight
          {data?.booking_data?.flightOffers[0]?.itineraries[1]?.segments?.map(
            (flight, index) => (
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
                        {findName(flight.carrierCode)}
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
                            ) {findAir(flight.departure.iataCode)}
                          </div>
                        </div>
                        <div className="col text-center">
                          <div className="flightLine">
                            <div />
                            <div />
                          </div>
                          <div className="text-12 lh-15 text-light-1 mt-10">
                            {TimeDifference(flight.duration)}
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
                            {flight.arrival.terminal
                              ? flight.arrival.terminal
                              : 0}
                            ) {findAir(flight.arrival.iataCode)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* {index < props.data.length - 1 && (
            <Alert color="warning">
              {TimeDifference(
                props.data[index].arrival.at,
                props.data[index + 1].departure.at
              )}{" "}
              layover in {getReturnAirport(flight.arrival.iataCode)}
            </Alert>
          )} */}
              </>
            )
          )}
        </div>
      )}

      <div className="row x-gap-20 items-end pt-3">
        <div className="col-12">
          <Card className="my-2" color="info" outline>
            {data?.booking_data?.travelers?.map((user) => (
              <>
                <CardBody>
                  <CardTitle tag="h5">
                    {`${userData?.first_name} ${userData?.last_name} (Booking Details)`}
                  </CardTitle>
                </CardBody>
                <Table hover>
                  <tbody>
                    <tr>
                      <th style={{ padding: "10px 20px" }}>Name</th>
                      <th style={{ padding: "10px 20px" }}>Email</th>
                      <th style={{ padding: "10px 20px" }}>Mobile</th>
                      <th style={{ padding: "10px 20px" }}>Booking Date</th>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 20px" }}>
                        {userData?.first_name} {userData?.last_name}
                      </td>
                      <td style={{ padding: "10px 20px" }}>
                        {userData?.email}
                      </td>
                      <td style={{ padding: "10px 20px" }}>
                        {userData?.mobile}
                      </td>
                      <td style={{ padding: "10px 20px" }}>
                        {moment(data?.booking_confirm_date).format(
                          "MMMM Do YYYY"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th style={{ padding: "10px 20px" }}>Departure Date</th>
                      {/* <th style={{ padding: "10px 20px" }}>
                        Refundable Amount
                      </th> */}
                      <th style={{ padding: "10px 20px" }}>Total Fare</th>
                      <th style={{ padding: "10px 20px" }}>Booking Status</th>
                      {data?.booking_status == "canceled" && (
                        <th style={{ padding: "10px 20px" }}>Refund Amount</th>
                      )}
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 20px" }}>
                        {moment(
                          data?.booking_data?.flightOffers[0]?.itineraries[0]
                            ?.segments[0]?.departure?.at
                        ).format("MMMM Do YYYY")}
                      </td>
                      {/* <td style={{ padding: "10px 20px" }}>
                      {data?.booking_data?.flightOffers[0]?.price?.currency} {data?.refundable_amount}{" "}
                      </td> */}
                      <td style={{ padding: "10px 20px" }}>
                        {data?.booking_data?.flightOffers[0]?.price?.currency}{" "}
                        {data?.amount}{" "}
                      </td>
                      <td style={{ padding: "10px 20px" }}>
                        <div className="text-capitalize">
                          {data?.booking_status === "canceled"
                            ? "Cancelled"
                            : data?.booking_status}{" "}
                        </div>
                      </td>
                      {data?.booking_status == "canceled" && (
                        <td style={{ padding: "10px 20px" }}>
                          {data?.booking_data?.flightOffers[0]?.price?.currency}{" "}
                          ${data?.refundable_amount}
                        </td>
                      )}
                    </tr>
                  </tbody>
                </Table>
              </>
            ))}
          </Card>
        </div>
        <div className="col-12">
          <Card className="my-2" color="info" outline>
            {data?.booking_data?.travelers?.map((user, index) => (
              <>
                <CardBody>
                  <CardTitle tag="h5">
                    {`${user?.name?.firstName} ${
                      user?.name?.lastName
                    } (Traveller ${index + 1})`}
                  </CardTitle>
                </CardBody>
                <Table hover>
                  <tbody>
                    <tr>
                      <th style={{ padding: "10px 20px" }}>Name</th>
                      <th style={{ padding: "10px 20px" }}>Gender</th>
                      <th style={{ padding: "10px 20px" }}>Date Of Birth</th>
                      <th style={{ padding: "10px 20px" }}>Purpose</th>
                      <th style={{ padding: "10px 20px" }}>Nationality</th>
                    </tr>
                    <tr>
                      <td
                        style={{ padding: "10px 20px" }}
                      >{`${user?.name?.firstName} ${user?.name?.lastName}`}</td>
                      <td style={{ padding: "10px 20px" }}>
                        <div className="text-capitalize">
                          {user?.gender.toLowerCase()}
                        </div>
                      </td>
                      <td style={{ padding: "10px 20px" }}>
                        {user?.dateOfBirth}
                      </td>
                      <td style={{ padding: "10px 20px" }}>
                        <div className="text-capitalize">
                          {user?.contact?.purpose.toLowerCase()}
                        </div>
                      </td>
                      <td style={{ padding: "10px 20px" }}>
                        {user?.documents[0]?.nationality}
                      </td>
                    </tr>
                    <tr>
                      <th style={{ padding: "10px 20px" }}>Passport Number</th>
                      <th style={{ padding: "10px 20px" }}>
                        Passport Issuing Country
                      </th>
                      <th style={{ padding: "10px 20px" }}>
                        Passport Issued Date
                      </th>
                      <th style={{ padding: "10px 20px" }}>
                        Passport Expiry Date
                      </th>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 20px" }}>
                        {user?.documents[0]?.number}
                      </td>
                      <td style={{ padding: "10px 20px" }}>
                        {user?.documents[0]?.issuanceCountry}
                      </td>
                      <td style={{ padding: "10px 20px" }}>
                        {user?.documents[0]?.issuanceDate}
                      </td>
                      <td style={{ padding: "10px 20px" }}>
                        {user?.documents[0]?.expiryDate}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
};

export default Details;
