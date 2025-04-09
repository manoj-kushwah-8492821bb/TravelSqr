"use client";
import { useState, useEffect } from "react";
import { getRequestToken, requestToken } from "../../../../api/Api";
import toast from "react-hot-toast";

import swal from "sweetalert";

import { FaXmark } from "react-icons/fa6";

import { FaEye } from "react-icons/fa";
import { RiRefund2Line } from "react-icons/ri";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import { Spinner } from "reactstrap";

import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";
import moment from "moment";

//import Pagination from "../../common/Pagination";
import ActionsButton from "../components/ActionsButton";
import axios from "axios";
import { BASE_URL } from "../../../../config";
import Details from "./Details";

const BookingTable = () => {
  let anArr = [];
  const [bookingData, setBookingData] = useState([]);
  const [bookingDataFilter, setBookingDataFilter] = useState([]);
  const [loader, setLoader] = useState(true);
  const [id, setId] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);

  const [pageLength, setPageLength] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [queryStatus, setQueryStatus] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [aiportName, setAiportName] = useState([]);
  const [modal, setModal] = useState(false);
  const [data, setData] = useState({});
  const [airportName, setAirportName] = useState([]);
  const [apiStatus, setApiStatus] = useState('');

  const toggle = () => {
    setModal(!modal);
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/booking/list?status=${apiStatus}&page=${page}&limit=${pageLength}&search=${search}`,
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoader(false);
      toast.error("Something went wrong. Try again later.");
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

  const completeRefund = async (data) => {
    const newData = { booking_id: data._id };
    bookingCancle(newData);
  };

  const bookingCancle = async (newData) => {
    const promise = await requestToken(
      "admin/refund",
      newData,
      "post",
      localStorage.getItem("token")
    );

    if (promise.error) {
      toast.error("Something went wrong. Try again later.");
    } else {
      if (promise.response.succeeded === true) {
        toast.success(promise.response.ResponseMessage);
        if (status == true) {
          setStatus(false);
        } else {
          setStatus(true);
        }
      } else {
        toast.error(promise.response.ResponseMessage);
      }
    }
  } 

  useEffect(() => {
    getData();
  }, [search, page, pageLength, queryStatus, status, apiStatus]);

  // useEffect(() => {
  //   getData();
  // }, [search, page, pageLength, queryStatus, status]);

  const containerStyle = {
    zIndex: 1999,
  };

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
  };
  // const renderPage = (pageNumber, isActive = false) => {
  //   const className = `size-40 flex-center rounded-full cursor-pointer ${
  //     isActive ? "bg-dark-1 text-white" : ""
  //   }`;
  //   return (
  //     <div key={pageNumber} className="col-auto">
  //       <div className={className} onClick={() => handlePageClick(pageNumber)}>
  //         {pageNumber}
  //       </div>
  //     </div>
  //   );
  // };

  // const renderPages = (pageTotal, currentPage) => {
  //   const totalPages = pageTotal; // Change this to the actual total number of pages
  //   const pageNumbers = [];
  //   for (let i = 1; i <= totalPages; i++) {
  //     pageNumbers.push(i);
  //   }
  //   const pages = pageNumbers.map((pageNumber) =>
  //     renderPage(pageNumber, pageNumber === currentPage)
  //   );
  //   return pages;
  // };
  const renderPages = (pageTotal, currentPage, numPagesToShow = 7) => {
    const totalPages = pageTotal;
    const pageNumbers = [];

    const startPage = Math.max(1, currentPage - Math.floor(numPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + numPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="row x-gap-20 y-gap-20 items-center md:d-none d-flex justify-content-between flex-nowrap">
        <div
          className={`size-40 flex-center rounded-full cursor-pointer ${
            currentPage === 1 ? "bg-dark-1 text-white" : ""
          }`}
          onClick={() => handlePageClick(1)}
        >
          |&lt;
        </div>
        {currentPage === 1 ? (
          <div
            className={`size-40 flex-center rounded-full cursor-pointer ${
              currentPage > 1 ? "bg-dark-1 text-white" : ""
            }`}
            style={{ cursor: "default", color: "grey" }}
          >
            &lt;
          </div>
        ) : (
          <div
            className={`size-40 flex-center rounded-full cursor-pointer ${
              currentPage > 1 ? "bg-dark-1 text-white" : ""
            }`}
            onClick={() => handlePageClick(currentPage - 1)}
          >
            &lt;
          </div>
        )}
        {startPage > 2 && (
          <div className="size-40 flex-center rounded-full cursor-pointer">
            ...
          </div>
        )}
        {pageNumbers.map((pageNumber) => (
          <div
            key={pageNumber}
            className={`size-40 flex-center rounded-full cursor-pointer ${
              pageNumber === currentPage ? "bg-dark-1 text-white" : ""
            }`}
            onClick={() => handlePageClick(pageNumber)}
          >
            {pageNumber}
          </div>
        ))}
        {endPage < totalPages - 1 && (
          <div className="size-40 flex-center rounded-full cursor-pointer">
            ...
          </div>
        )}
        {currentPage === totalPages ? (
          <div
            className={`size-40 flex-center rounded-full cursor-pointer ${
              currentPage < totalPages ? "bg-dark-1 text-white" : ""
            }`}
            style={{ cursor: "default", color: "grey" }}
          >
            &gt;
          </div>
        ) : (
          <div
            className={`size-40 flex-center rounded-full cursor-pointer ${
              currentPage < totalPages ? "bg-dark-1 text-white" : ""
            }`}
            onClick={() => handlePageClick(currentPage + 1)}
          >
            &gt;
          </div>
        )}
        <div
          className={`size-40 flex-center rounded-full cursor-pointer ${
            currentPage === totalPages ? "bg-dark-1 text-white" : ""
          }`}
          onClick={() => handlePageClick(totalPages)}
        >
          &gt;|
        </div>
      </div>
    );
  };

  const handleTabClick = (index, item) => {
    setLoader(true);
    setActiveTab(index);
    // const data = [...bookingData];
    // if (item === "Completed") {
    //   const completedBookings = bookingDataFilter.filter(
    //     (element) => element.booking_status === "completed"
    //   );
    //   setBookingData(completedBookings);
    // } else if (item === "Confirmed") {
    //   const completedBookings = bookingDataFilter.filter(
    //     (element) => element.booking_status === "confirmed"
    //   );
    //   setBookingData(completedBookings);
    // } else if (item === "Cancelled") {
    //   const completedBookings = bookingDataFilter.filter(
    //     (element) => element.booking_status === "canceled"
    //   );
    //   setBookingData(completedBookings);
    // } else if (item === "refund_in_progress") {
    //   const completedBookings = bookingDataFilter.filter(
    //     (element) => element.booking_status === "refund_in_progress"
    //   );
    //   setBookingData(completedBookings);
    // } else {
    //   setBookingData(bookingDataFilter);
    // }

    const data = [...bookingData];
    if (item === "Completed") {
      setApiStatus('completed');
      setPage(1);
    } else if (item === "Confirmed") {
      setApiStatus('confirmed');
      setPage(1);
    } else if (item === "Cancelled") {
      setApiStatus('canceled');
      setPage(1);
    } else if (item === "refund_in_progress") {
      setApiStatus('refund_in_progress');
      setPage(1);
    } else {
      setApiStatus('');
      setPage(1);
    }
  };

  const tabItems = ["All Bookings", "Confirmed", "Completed", "Cancelled", "refund_in_progress"];
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
      // console.error(
      //   `Error getting currency symbol for ${code}: ${error.message}`
      // );
      return null;
    }
  };
  const changePagePerItem = (e) => {
    const newPageLength = parseInt(e.target.value, 10);
    const currentTotalItems = pageLength * (page - 1) + 1; // Calculate the current total items
    const newPage = Math.ceil(currentTotalItems / newPageLength);
  
    setPageLength(newPageLength);
    setPage(newPage);
  }

  return (
    <>
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        style={containerStyle}
      /> */}
      <div className="tabs -underline-2 js-tabs">
        <div className="tabs__controls row x-gap-40 y-gap-10 lg:x-gap-20 js-tabs-controls">
          {tabItems.map((item, index) => (
            <div className="col-auto" key={index}>
              <button
                className={`tabs__button text-18 lg:text-16 text-light-1 fw-500 pb-5 lg:pb-0 js-tabs-button ${
                  activeTab === index ? "is-tab-el-active" : ""
                }`}
                onClick={() => handleTabClick(index, item)}
              >
                <div className="text-capitalize">{item}</div>
              </button>
            </div>
          ))}
        </div>
        {/* End tabs */}

        <div className="tabs__content pt-30 js-tabs-content">
          <div className="tabs__pane -tab-item-1 is-tab-el-active">
            <div
              className="overflow-scroll scroll-bar-2"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <table className="table-3 -border-bottom col-12">
                <thead className="bg-light-2">
                  <tr>
                    <th className="text-center">User Name</th>
                    <th className="text-center">Flight From</th>
                    <th className="text-center">Flight To</th>
                    <th className="text-center">Booking Date</th>
                    <th className="text-center">Departure Date</th>
                    <th className="text-center">Total Fare</th>
                    {activeTab === 0 && <th className="text-center">Status</th>}
                    <th className="text-center">Action</th>
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
                              {/* {getAirportName(item?.booking_data?.flightOffers[0]?.itineraries[0]?.segments[item?.booking_data?.flightOffers[0]?.itineraries[0]?.segments?.length-1]?.arrival?.iataCode)} */}
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
                              ).format("MMM D  YYYY, h:mm a")}
                            </td>
                            <td>
                              {getCurrencySymbol(
                                item?.booking_data?.flightOffers[0]?.price
                                  ?.currency
                              )}{" "}
                              {item?.amount}
                            </td>
                            {activeTab == 0 && (
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
                            )}

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
                              &nbsp; &nbsp;
                              {item?.booking_status === "refund_in_progress" &&
                              <Tooltip
                                title="Complete Refund"
                                position="bottom"
                                arrow={true}
                                distance={15}
                                trigger="mouseenter"
                              >
                                <RiRefund2Line
                                  className="iconcolor"
                                  onClick={() => {
                                    completeRefund(item);
                                  }}
                                  size="25"
                                ></RiRefund2Line>
                              </Tooltip>
                              }
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
      {/* <Pagination /> */}
      <div className="border-top-light mt-30 pt-30">
        <div className="row x-gap-10 y-gap-20 justify-between md:justify-center">
          <div className="col-1">
            <select onChange={changePagePerItem}
              // onChange={(e) => {
              //   setPageLength(e.target.value);
              // }}
              class="form-select"
              aria-label="Default select example"
            >
              <option value={10} selected={pageLength == 10}>
                10
              </option>
              <option value={20} selected={pageLength == 20}>
                20
              </option>
              <option value={30} selected={pageLength == 30}>
                30
              </option>
            </select>
          </div>
          <div className="col-1">&nbsp;</div>

          <div className="col-10 d-flex justify-content-end">
            <div className="row x-gap-20 y-gap-20 items-center md:d-none">
              {renderPages(totalPages, page)}
            </div>
          </div>
        </div>
      </div>
      {/* <Pagination /> */}
      <Modal isOpen={modal} toggle={toggle} size="xl" backdrop={true}>
        <ModalHeader toggle={toggle}>Booking Details</ModalHeader>
        <ModalBody>
          <Details data={data} />
        </ModalBody>
        <ModalFooter></ModalFooter>
      </Modal>
      {/* <Pagination /> */}
    </>
  );
};

export default BookingTable;
