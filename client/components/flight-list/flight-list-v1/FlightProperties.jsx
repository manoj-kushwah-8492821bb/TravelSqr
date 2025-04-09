import { useRouter } from "next/router";
import moment from "moment";
import { Spinner } from "reactstrap";
import Link from "next/link";
import { useState } from "react";
import { request, getRequestToken } from "../../../api/Api";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col,
} from "reactstrap";
import Flights from "./flight";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { PaymentStart } from "../../../features/PaymentSlice";
import { RouteChange } from "../../../features/GuestUserSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import classnames from "classnames";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const FlightProperties = (props) => {
  const dispatch = useDispatch();
  let searchResult = useSelector((state) => state?.flightSearch);
  let airLineList = useSelector((state) => state?.SidebarData?.airlines);
  const [loginModal, setLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [flightDetail, setFlightDetail] = useState(null);
  const [returnFlightDetail, setReturnFlightDetail] = useState(null);
  const [flightLoading, setFlightLoading] = useState({});
  const [logo, setLogo] = useState([]);
  const [flightDetailsData, setFlightDetailsData] = useState({});
  const [aiportName, setAiportName] = useState([]);
  const [stopDataClick, setStopDataClick] = useState([]);
  const router = useRouter();
  // if (props.searchResult.length < 1) {
  //   return <div>No flight data available</div>;
  // }

  useEffect(() => {
    if (airLineList) {
      Object.keys(airLineList).map((key) => {
        getData(key);
      });
    }
  }, [airLineList]);

  const [showPassword, setShowPassword] = useState("password");

  const [currentActiveTab, setCurrentActiveTab] = useState("1");
  const [tabCon1, setTabCon1] = useState("");
  const [tabCon2, setTabCon2] = useState("");

  const toggleTabs = (tab) => {
    if (currentActiveTab !== tab) setCurrentActiveTab(tab);
  };

  //const router = useRouter();
  const initialValues = {
    email: "",
    password: "",
  };
  const validationSchema = Yup.object({
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Entered email is invalid"
      )
      .required("Email is required"),
    password: Yup.string().required("Password field is required"),
  });

  function setCookie(name, value, days) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const cookieValue =
      encodeURIComponent(value) +
      "; expires=" +
      expirationDate.toUTCString() +
      "; path=/";

    document.cookie = name + "=" + cookieValue;
  }
  const onSubmit = async (values, { resetForm }) => {
    setLoginLoading(true);
    const data = {
      email: values.email,
      password: values.password,
    };
    const promise = await request("user/login", data, "post");

    if (promise.error) {
      toast.error("Something went wrong. Please try again later.");
      setLoginLoading(false);
    } else {
      if (promise.response.succeeded === true) {
        //setLoginLoading(false);
        //console.log(promise.response.ResponseBody.token);
        const promiseToken = await getRequestToken(
          "user/auth",
          {},
          "get",
          promise.response.ResponseBody.token
        );
        if (promiseToken.error) {
          toast.error("Something went wrong. Please try again later.");
          setLoginLoading(false);
        } else {
          if (promiseToken?.response?.succeeded === true) {
            setCookie("userToken", promise.response.ResponseBody.token, 1);
            localStorage.setItem(
              "userToken",
              promise.response.ResponseBody.token
            );
            localStorage.setItem(
              "name",
              `${promiseToken.response.ResponseBody.first_name} ${promiseToken.response.ResponseBody.last_name}`
            );
            localStorage.setItem(
              "profile",
              promiseToken.response.ResponseBody.profile_pic
            );
            setLoginLoading(false);
            flightOfferPrice(flightDetailsData);
            setLoginModal(false);
          } else {
            toast.error(promiseToken.response.ResponseMessage);
            setLoginLoading(false);
            flightOfferPrice(flightDetailsData);
            setLoginModal(false);
          }
        }
        setLoginLoading(false);
      } else {
        if (promise.response.ResponseMessage == "Invalid Password!") {
          toast.error("Invalid Username / Password");
        } else {
          toast.error(promise.response.ResponseMessage);
        }
        setLoginLoading(false);
      }
    }
    //setLoading(false);
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema,
  });

  const containerStyle = {
    zIndex: 1999,
  };

  const TimeDifference = (duration) => {
    const str = duration;
    const hoursMatch = str.match(/(\d+)H/);
    const minutesMatch = str.match(/(\d+)M/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return `${hours}h ${minutes}m`;
  };

  const flightOfferPrice = async (item) => {
    // await item.itineraries.forEach(element => {
    //   element.segments.forEach(innerElement => {
    //     getAirport(innerElement.arrival.iataCode);
    //     getAirport(innerElement.departure.iataCode);
    //   });
    // });
    //setLoading(true);

    let flightLoadingCopy = { ...flightLoading };
    flightLoadingCopy[item.id] = true;
    setFlightLoading(flightLoadingCopy);
    setLoading(true);

    if (
      typeof window !== "undefined" &&
      localStorage.getItem("userToken") !== null
    ) {
      let data = { flightData: item };
      //console.log(data);

      const promise = await request(`flight/flight-offers-price`, data, "post");
      if (promise.error) {
        //toast.error(promise.error.response.data.ResponseMessage);
        toast.error("Something went wrong, Try again.");
        flightLoadingCopy = { ...flightLoading };
        flightLoadingCopy[item.id] = false;
        setFlightLoading(flightLoadingCopy);
        setLoading(false);
      } else {
        dispatch(PaymentStart(promise.response.flightOffers[0]));
        router.push({ pathname: "/payment" });
        //flightLoadingCopy = { ...flightLoading };
        //flightLoadingCopy[item.id] = false;
        //setFlightLoading(flightLoadingCopy);
        //setLoading(false);
      }
    } else {
      setLoginModal(!loginModal);
    }
  };

  const flightDetails = (flightDetails, returnFlightDetails) => {
    setModal(!modal);
    setFlightDetail(flightDetails);
    setReturnFlightDetail(returnFlightDetails);
  };

  const toggle = () => {
    setModal(!modal);
    formik.resetForm();
  };
  const loginToggle = () => {
    let flightLoadingCopy = { ...flightLoading };
    Object.keys(flightLoadingCopy).forEach((key) => {
      flightLoadingCopy[key] = false;
    });

    setFlightLoading(flightLoadingCopy);
    setLoading(false);
    setLoginModal(!loginModal);
  };

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

  const getData = async (key) => {
    const promise = await request(`flight/airlines?code=${key}`, {}, "get");
    if (promise.error) {
      //return null; // Return a default value or handle the error as needed
    } else {
      // let response = {key:promise.response.ResponseBody[0].logo}
      // setLogo(logo=>[...logo,response]);
      if (promise.response.ResponseBody[0].logo == "") {
        const logoData = "/img/flightIcons/1.png";
        setLogo((prevLogo) => [...prevLogo, { key, logo: logoData }]);
      } else {
        const logoData = promise.response.ResponseBody[0].logo;
        setLogo((prevLogo) => [...prevLogo, { key, logo: logoData }]);
      }
    }
  };

  const findLogo = (key) => {
    let data = logo.filter((element) => element.key === key);
    //console.log(data[0]?.logo);
    if (data[0]?.logo) {
      return data[0]?.logo;
    }
  };
  //console.log(props?.searchResult?.flightSearch?.data);
  useEffect(() => {
    setStopDataClick(props.stopsClick);
  }, [props.stopsClick]);

  useEffect(() => {
    props?.totalCount(searchResult?.flightSearch?.data?.length);
  }, [searchResult?.flightSearch?.data?.length]);

  const signUp = () => {console.log('ashi');
    dispatch(RouteChange("/flight"));
    router.push({
      pathname: "/user/signup",
    });
  };

  function isValidURL(url) {
    var urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
  }
  return (
    <>
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        style={containerStyle}
      /> */}
      {searchResult?.flightSearch?.data?.length != 0 ? (
        searchResult?.flightSearch?.data?.map((item) =>
          stopDataClick.includes(
            item?.itineraries[0]?.segments?.length?.toString()
          ) == true || stopDataClick?.length == 0 ? (
            <div className="js-accordion" key={item.id}>
              <div className="py-30 px-30 bg-white rounded-4 base-tr mt-30">
                <div className="row y-gap-30 justify-between">
                  <div className="col">
                    {item?.itineraries[0]?.segments?.map((stopData) => (
                      <>
                        <div className="row x-gap-20 items-end pt-3">
                          <div className="col-3">
                            <div>
                              {isValidURL(findLogo(stopData?.carrierCode)) ? (
                                <img
                                  className="size-40"
                                  src={findLogo(stopData?.carrierCode)}
                                  style={{ borderRadius: "50%" }}
                                  alt="image"
                                />
                              ) : (
                                <Skeleton
                                  circle
                                  height={"40px"}
                                  width={"40px"}
                                />
                              )}
                            </div>
                            <div className="text-15 lh-15 text-light-1">
                            {capitalizeFLetter(
                                searchResult?.flightSearch?.dictionaries
                                  ?.carriers[stopData?.carrierCode]
                              )}
                            </div>
                          </div>
                          <div className="col-9">
                            <div className="row x-gap-20 items-end">
                              <div className="col-auto">
                                <div className="lh-15 fw-500">
                                  {moment(stopData?.departure.at).format(
                                    "h:mm  a"
                                  )}
                                </div>
                                <div className="text-15 lh-15 text-light-1">
                                  {" "}
                                  {stopData?.departure?.iataCode}
                                  <br />
                                </div>
                              </div>
                              <div className="col text-center">
                                <div className="text-15 lh-15 text-light-1 mb-10">
                                  {TimeDifference(stopData?.duration)}
                                </div>
                                <div className="flightLine">
                                  <div />
                                  <div />
                                </div>
                                <div className="text-15 lh-15 text-light-1 mt-10">
                                  {item?.itineraries[0]?.segments?.length == 1
                                    ? "Nonstop"
                                    : item?.itineraries[0]?.segments?.length ==
                                      2
                                    ? "1 stop"
                                    : item?.itineraries[0]?.segments?.length ==
                                      3
                                    ? "2 stop"
                                    : "many stops"}
                                </div>
                              </div>
                              <div className="col-auto">
                                <div className="lh-15 fw-500">
                                  {moment(stopData?.arrival?.at).format(
                                    "h:mm a"
                                  )}
                                </div>
                                <div className="text-15 lh-15 text-light-1">
                                  {stopData?.arrival?.iataCode}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                  </div>
                  {item?.itineraries[1] && (
                    <div
                      className="col"
                      style={{ borderLeft: "1px solid #ddd" }}
                    >
                      {item?.itineraries[1]?.segments?.map((stopData) => (
                        <>
                          <div className="row x-gap-20 items-end pt-3">
                            <div className="col-3">
                              <div>
                              {isValidURL(findLogo(stopData?.carrierCode)) ? (
                                <img
                                  className="size-40"
                                  src={findLogo(stopData?.carrierCode)}
                                  style={{ borderRadius: "50%" }}
                                  alt="image"
                                />
                              ) : (
                                <Skeleton
                                  circle
                                  height={"40px"}
                                  width={"40px"}
                                />
                              )}
                              </div>
                              <div className="text-15 lh-15 text-light-1">
                                {capitalizeFLetter(
                                  searchResult?.flightSearch?.dictionaries
                                    ?.carriers[stopData?.carrierCode]
                                )}
                              </div>
                            </div>
                            <div className="col-9">
                              <div className="row x-gap-20 items-end">
                                <div className="col-auto">
                                  <div className="lh-15 fw-500">
                                    {moment(stopData?.departure?.at).format(
                                      "h:mm  a"
                                    )}
                                  </div>
                                  <div className="text-15 lh-15 text-light-1">
                                    {" "}
                                    {stopData?.departure?.iataCode}
                                    <br />
                                  </div>
                                </div>
                                <div className="col text-center">
                                  <div className="text-15 lh-15 text-light-1 mb-10">
                                    {TimeDifference(stopData?.duration)}
                                  </div>
                                  <div className="flightLine">
                                    <div />
                                    <div />
                                  </div>
                                  <div className="text-15 lh-15 text-light-1 mt-10">
                                    {item?.itineraries[0]?.segments?.length == 1
                                      ? "Nonstop"
                                      : item?.itineraries[0]?.segments
                                          ?.length == 2
                                      ? "1 stop"
                                      : item?.itineraries[0]?.segments
                                          ?.length == 3
                                      ? "2 stop"
                                      : "many stops"}
                                  </div>
                                </div>
                                <div className="col-auto">
                                  <div className="lh-15 fw-500">
                                    {moment(stopData?.arrival?.at).format(
                                      "h:mm a"
                                    )}
                                  </div>
                                  <div className="text-15 lh-15 text-light-1">
                                    {stopData?.arrival?.iataCode}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ))}
                    </div>
                  )}

                  <div className="col-md-auto">
                    <div className="d-flex items-center h-full">
                      <div className="pl-30 border-left-light h-full md:d-none" />
                      <div>
                        <div className="text-right md:text-left mb-10">
                          <div className="text-18 lh-16 fw-500">{`${item?.price?.currency} ${item?.price?.grandTotal}`}</div>
                          <div className="text-15 lh-16 text-light-1">
                            {item?.numberOfBookableSeats} Seats
                          </div>
                        </div>
                        <div className="accordion__button">
                          <button
                            className="button -dark-1 px-30 h-50 bg-blue-1 text-white"
                            data-bs-toggle="collapse"
                            onClick={() => {
                              flightOfferPrice(item),
                                setFlightDetailsData(item);
                            }}
                            disabled={loading}
                          >
                            {flightLoading[item.id] ? (
                              <>
                                <Spinner></Spinner>&nbsp;Loading...
                              </>
                            ) : (
                              <>Book Now</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-auto">
                  <button
                    onClick={() => {
                      flightDetails(
                        item?.itineraries[0]?.segments,
                        item?.itineraries[1]?.segments
                      );
                    }}
                    className="buttonSmall"
                  >
                    Flight Details
                  </button>
                </div>
              </div>
            </div>
          ) : null
        )
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>
            <img
              src="/img/notfound.png"
              alt="Loading..."
              className="loader"
              width={450}
              height={218}
            />
          </div>
          <div>
            <h4>Sorry no flight found on this date...</h4>
          </div>
        </div>
      )}
      <Modal
        isOpen={loginModal}
        toggle={loginToggle}
        size="L"
        backdrop={true}
        centered
      >
        <ModalHeader toggle={loginToggle}></ModalHeader>
        <ModalBody>
          <section>
            <div className="container">
              {/* <div className="row y-gap-20 justify-between items-end">
                <div className="col-auto">
                  <div className="sectionTitle -md">
                    <h2 className="sectionTitle__title">Please Login</h2>
                  </div>
                </div>
              </div> */}

              <div className="row y-gap-30 pt-40 sm:pt-20">
                <div className="col-12">
                  <h1 className="text-22 fw-500">Please Login</h1>
                  <p className="mt-10">
                    Don&apos;t have an account yet?{" "}
                    <button onClick={signUp} className="text-blue-1">
                      Sign up for free
                    </button>
                  </p>
                </div>
                <form className="row y-gap-20" onSubmit={formik.handleSubmit}>
                  <div className="col-12">
                    <div className="form-input">
                      <input
                        type="text"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        tabIndex={1}
                      />
                      <label className="lh-1 text-14 text-light-1">Email</label>
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <span className="text-danger">{formik.errors.email}</span>
                    )}
                  </div>

                  <div className="col-12">
                    <div className="form-input">
                      <input
                        type={showPassword}
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={{
                          borderRight: "none",
                          width: "85%",
                          borderTopRightRadius: "0px",
                          borderBottomRightRadius: "0px",
                        }}
                        tabIndex={2}
                      />
                      <span
                        className="showPassword"
                        style={{ cursor: "pointer" }}
                      >
                        {showPassword === "text" ? (
                          <img
                            src="/img/icon/eyeOpen.png"
                            width={"90%"}
                            alt="logo icon"
                            onClick={() => {
                              setShowPassword("password");
                            }}
                            onKeyPress={(event) => {
                              // Check if the key pressed is the "Enter" key
                              if (event.key === "Enter") {
                                setShowPassword("password");
                              }
                            }}
                            tabIndex={3}
                            role="button"
                          />
                        ) : (
                          <img
                            src="/img/icon/eyesClose.png"
                            width={"90%"}
                            alt="logo icon"
                            onClick={() => {
                              setShowPassword("text");
                            }}
                            onKeyPress={(event) => {
                              // Check if the key pressed is the "Enter" key
                              if (event.key === "Enter") {
                                setShowPassword("text");
                              }
                            }}
                            tabIndex={3}
                            role="button"
                          />
                        )}
                      </span>
                      <label className="lh-1 text-14 text-light-1">
                        Password
                      </label>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <span className="text-danger">
                        {formik.errors.password}
                      </span>
                    )}
                  </div>
                  {/* End .col */}

                  <div className="col-12">
                    <Link
                      href="/user/forgot-password"
                      className="text-14 fw-500 text-blue-1 underline"
                      tabIndex={4}
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  {/* End .col */}

                  <div className="col-12">
                    <button
                      type="submit"
                      className="button py-20 -dark-1 bg-blue-1 text-white w-100"
                      disabled={loginLoading}
                      tabIndex={5}
                    >
                      {loginLoading ? (
                        <>
                          <Spinner></Spinner>&nbsp;Loading...
                        </>
                      ) : (
                        <>
                          Sign In <div className="icon-arrow-top-right ml-15" />
                        </>
                      )}
                    </button>
                  </div>
                  {/* End .col */}
                </form>
              </div>
              {/* End .row */}
            </div>
            {/* End .container */}
          </section>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </Modal>

      <Modal isOpen={modal} toggle={toggle} size="xl" backdrop={true} centered>
        <ModalHeader toggle={toggle}>
          <Nav tabs style={{ marginBottom: "-18px" }}>
            {flightDetail && (
              <NavItem style={{ cursor: "pointer" }}>
                <NavLink
                  className={classnames({
                    active: currentActiveTab === "1",
                  })}
                  onClick={() => {
                    toggleTabs("1");
                  }}
                >
                  <div className="text-15 lh-15 fw-500">
                    {flightDetail[0]?.departure?.iataCode} -{" "}
                    {flightDetail[flightDetail.length - 1]?.arrival?.iataCode}
                  </div>
                  <div className="text-14 lh-15 fw-500">
                    {moment(flightDetail[0]?.departure?.at).format(
                      "MMM Do YYYY"
                    )}
                  </div>
                </NavLink>
              </NavItem>
            )}
            {returnFlightDetail && (
              <NavItem style={{ cursor: "pointer" }}>
                <NavLink
                  className={classnames({
                    active: currentActiveTab === "2",
                  })}
                  onClick={() => {
                    toggleTabs("2");
                  }}
                >
                  <div className="text-15 lh-15 fw-500">
                    {returnFlightDetail[0]?.departure?.iataCode} -{" "}
                    {
                      returnFlightDetail[returnFlightDetail.length - 1]?.arrival
                        ?.iataCode
                    }
                  </div>
                  <div className="text-14 lh-15 fw-500">
                    {moment(returnFlightDetail[0]?.departure?.at).format(
                      "MMM Do YYYY"
                    )}
                  </div>
                </NavLink>
              </NavItem>
            )}
          </Nav>
        </ModalHeader>
        <ModalBody>
          <section>
            <div className="container">
              {/* <div className="row y-gap-20 justify-between items-end">
                <div className="col-auto">
                  <div className="sectionTitle -md">
                    <h5 className="sectionTitle__title">Flight Details</h5>
                  </div>
                </div>
              </div> */}

              <div className="row y-gap-20 pt-5 sm:pt-10">
                <TabContent activeTab={currentActiveTab}>
                  <Flights
                    data={flightDetail}
                    returnData={returnFlightDetail}
                    carrier={searchResult?.flightSearch?.dictionaries?.carriers}
                    logo={logo}
                    currentActiveTab={currentActiveTab}
                  />
                </TabContent>
              </div>
              {/* End .row */}
            </div>
            {/* End .container */}
          </section>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </Modal>
    </>
  );
};

export default FlightProperties;
