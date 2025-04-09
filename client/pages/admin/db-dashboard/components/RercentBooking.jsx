"use client";
import { useState, useEffect } from "react";
import { getRequestToken, requestToken } from "../../../../api/Api";
import toast from "react-hot-toast";

import swal from "sweetalert";

import { FaEye } from "react-icons/fa";
import { RiRefund2Line } from "react-icons/ri";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import { Spinner } from "reactstrap";

import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";
import moment from "moment";

//import Pagination from "../../common/Pagination";
import axios from "axios";
import { BASE_URL } from "../../../../config";
import Details from "../../db-booking/components/Details";

const RercentBooking = () => {
  let anArr = [];
  const [bookingData, setBookingData] = useState([]);
  const [bookingDataFilter, setBookingDataFilter] = useState([]);
  const [loader, setLoader] = useState(true);
  const [id, setId] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);

  const [pageLength, setPageLength] = useState(100);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [queryStatus, setQueryStatus] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [aiportName, setAiportName] = useState([]);
  const [modal, setModal] = useState(false);
  const [data, setData] = useState({});
  const [airportName, setAirportName] = useState([]);

  const toggle = () => {
    setModal(!modal);
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/booking/list?page=${page}&limit=${7}&search=${search}&status=${queryStatus}`,
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoader(false);
      toast.error('Something went wrong. Try again later.');
    } else {
      setLoader(false);
      setBookingData(promiseToken.response.ResponseBody.docs);
      setBookingDataFilter(promiseToken.response.ResponseBody.docs);
      setTotalPages(promiseToken.response.ResponseBody.totalPages);
      promiseToken.response.ResponseBody.docs.map((data, index) => {
        if (
          data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[0]
            ?.departure?.iataCode != undefined
        ) {
          getAirport(
            data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[0]
              ?.departure?.iataCode,
            index
          );
          getAirport(
            data?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[
              data.booking_data.flightOffers[0].itineraries[0].segments.length -
                1
            ]?.arrival?.iataCode
          );
        }
      });
    }
  };

  useEffect(() => {
    getData();
  }, [search, page, pageLength, queryStatus, status]);

  // useEffect(() => {
  //   getData();
  // }, [search, page, pageLength, queryStatus, status]);

  const containerStyle = {
    zIndex: 1999,
  };

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
  };
  const renderPage = (pageNumber, isActive = false) => {
    const className = `size-40 flex-center rounded-full cursor-pointer ${
      isActive ? "bg-dark-1 text-white" : ""
    }`;
    return (
      <div key={pageNumber} className="col-auto">
        <div className={className} onClick={() => handlePageClick(pageNumber)}>
          {pageNumber}
        </div>
      </div>
    );
  };

  const renderPages = (pageTotal, currentPage) => {
    const totalPages = pageTotal; // Change this to the actual total number of pages
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    const pages = pageNumbers.map((pageNumber) =>
      renderPage(pageNumber, pageNumber === currentPage)
    );
    return pages;
  };

  const handleTabClick = (index, item) => {
    setActiveTab(index);
    const data = [...bookingData];
    if (item === "Completed") {
      const completedBookings = bookingDataFilter.filter(
        (element) => element.booking_status === "completed"
      );
      setBookingData(completedBookings);
    } else if (item === "Confirmed") {
      const completedBookings = bookingDataFilter.filter(
        (element) => element.booking_status === "refunded"
      );
      setBookingData(completedBookings);
    } else if (item === "Refunded") {
      const completedBookings = bookingDataFilter.filter(
        (element) => element.booking_status === "refunded"
      );
      setBookingData(completedBookings);
    } else {
      setBookingData(bookingDataFilter);
    }
  };

  const tabItems = ["All Booking", "Completed", "Refunded"];
  const color = { completed: "blue", refunded: "red", pending: "yellow" };

  async function getAirport(key, index) {
    const config = {
      headers: { "Content-Type": "application/json" },
    };
    if (key !== undefined && key !== "") {
      //console.log(getCode);
      axios
        .get(`${BASE_URL}flight/airports?code=${key}`, config)
        .then((res) => {
          //console.log(res?.data?.ResponseBody?.docs[0]?.name)
          setAiportName((aiportName) => [
            ...aiportName,
            { key, index: index, name: res?.data?.ResponseBody?.docs[0]?.name },
          ]);
        })
        .catch((err) => {
          //console.log(err)
        });
    }
  }

  const getAirPN = (index) => {
    const result = aiportName.find((item) => item.key === index);
    return result?.name;
  };
  // const getAirPNT = (index) => {
  //   const result = aiportNameT.find(item => item.key === index);
  //   return result?.name;
  // }

  const completeRefund = async (booking_id) => {
    setLoading(true);
    const promise = await requestToken(
      "admin/refund",
      { booking_id: booking_id },
      "post",
      localStorage.getItem("token")
    );

    if (promise.error) {
      toast.error(promise.error.response.data.ResponseMessage);
      setLoading(false);
    } else {
      if (promise.response.succeeded === true) {
        if (status == true) {
          setStatus(false);
        } else {
          setStatus(true);
        }
        toast.success(promise.response.ResponseMessage);
      } else {
        toast.error(promise.response.ResponseMessage);
      }
      getData();
      setLoading(false);
    }
  };
  
  const getCurrencySymbol = (code) => {
    try {
      const currencyFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
      });

      const parts = currencyFormatter.formatToParts(0);
      const currencySymbol = parts.find(
        (part) => part.type === "currency"
      ).value;

      return currencySymbol;
    } catch (error) {
      console.error(
        `Error getting currency symbol for ${code}: ${error.message}`
      );
      return null;
    }
  };
  //console.log("arr", anArr);
  return (
    <>
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        style={containerStyle}
      /> */}
      <div className="tabs -underline-2 js-tabs">
        <div className="tabs__content pt-30 js-tabs-content">
          <div className="tabs__pane -tab-item-1 is-tab-el-active">
            <div className="table-container overflow-auto scroll-bar-2">
              <table className="table-3 -border-bottom col-12">
                <thead className="bg-light-2">
                  <tr>
                    <th className="text-center">User Name</th>
                    <th className="text-center">Flight From</th>
                    <th className="text-center">Flight To</th>
                    <th className="text-center">Booking Date</th>
                    <th className="text-center">Departure Date</th>
                    <th className="text-center">Total Fare</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">View</th>
                  </tr>
                </thead>
                <tbody>
                  {loader === true ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center" }}>
                        <Spinner color="primary"></Spinner>
                      </td>
                    </tr>
                  ) : bookingData.length < 1 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center" }}>
                        No booking found
                      </td>
                    </tr>
                  ) : (
                    bookingData.map((item, index) => {
                      return (
                        <>
                          <tr key={index + 1}>
                            <td>{`${item?.user?.name}`}</td>
                            <td>
                              {getAirPN(
                                item?.booking_data?.flightOffers[0]
                                  ?.itineraries[0]?.segments[0]?.departure
                                  ?.iataCode
                              )}
                              {/* {
                                item?.booking_data?.flightOffers[0]
                                  ?.itineraries[0]?.segments[0]?.departure
                                  ?.iataCode
                              } */}
                              {/* {getAirport(
                                item?.booking_data?.flightOffers[0]
                                  ?.itineraries[0]?.segments[0]?.departure
                                  ?.iataCode,index
                              )} */}
                              {/* {airportName} */}
                            </td>
                            <td>
                              {getAirPN(
                                item?.booking_data?.flightOffers[0]
                                  ?.itineraries[0]?.segments[
                                  item?.booking_data?.flightOffers[0]
                                    ?.itineraries[0]?.segments?.length - 1
                                ]?.arrival?.iataCode
                              )}
                            </td>
                            <td>
                              {moment(item?.createdAt).format(
                                "MMM D YYYY, h:mm a"
                              )}
                            </td>
                            <td>
                              {moment(
                                item?.booking_data?.flightOffers[0]
                                  ?.itineraries[0]?.segments[0]?.departure?.at
                              ).format("MMM D YYYY, h:mm a")}
                            </td>
                            <td>
                              {getCurrencySymbol(
                                item?.booking_data?.flightOffers[0]?.price
                                  ?.currency
                              )}{" "}
                              {item?.amount}
                            </td>
                            <td>
                              {item?.booking_status == "confirmed" ? (
                                <span
                                  className={`rounded-100 py-4 px-10 text-center text-14 fw-500 bg-yellow-4 text-yellow-3`}
                                >
                                  Confirmed
                                </span>
                              ) : item?.booking_status == "completed" ? (
                                <span
                                  className={`rounded-100 py-4 px-10 text-center text-14 fw-500 bg-blue-1-05 text-blue-1`}
                                >
                                  Completed
                                </span>
                                ) : item?.booking_status == "canceled"? (
                                  <span
                                    className={`rounded-100 py-4 px-10 text-center text-14 fw-500 bg-red-3 text-red-2`}
                                  >
                                    Cancelled
                                  </span>
                                ) : item?.booking_status == "refund_in_progress" ? (
                                  <span
                                    className={`rounded-100 py-4 px-10 text-center text-14 fw-500 bg-red-3 text-red-2`}
                                  >
                                    Refund_in_progress
                                  </span>
                                ) : null}
                            </td>
                            <td
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                            <Tooltip
                                title="View Details"
                                position="bottom"
                                arrow={true}
                                distance={15}
                                trigger="mouseenter"
                              >
                                <FaEye
                                  className="iconcolor"
                                  onClick={() => {
                                  setModal(true);
                                  setData(item);
                                }}
                                  size="25"
                                ></FaEye>
                              </Tooltip>
                              {/* &nbsp; &nbsp;
                              <Tooltip
                                title="Initiate Refund"
                                position="bottom"
                                arrow={true}
                                distance={15}
                                trigger="mouseenter"
                              >
                                <RiRefund2Line
                                  className="iconcolor"
                                  disabled={
                                  item?.payment_status === "refund_in_progress"
                                    ? false
                                    : true
                                }
                                onClick={() => {
                                  completeRefund(item?._id);
                                }}
                                  size="25"
                                ></RiRefund2Line>
                              </Tooltip> */}
                            </td>
                          </tr>
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modal} toggle={toggle} size="xl" backdrop={true}>
        <ModalHeader toggle={toggle}>Booking Details</ModalHeader>
        <ModalBody>
          <Details data={data} />
        </ModalBody>
        <ModalFooter></ModalFooter>
      </Modal>
    </>
  );
};

export default RercentBooking;
