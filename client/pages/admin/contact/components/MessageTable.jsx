"use client";
import { useState, useEffect } from "react";
import { getRequestToken } from "../../../../api/Api";
import toast from "react-hot-toast";

import "react-tippy/dist/tippy.css";
import { Spinner } from "reactstrap";
import moment from "moment";
import { FaRegEnvelope } from "react-icons/fa6";
import { Tooltip } from "react-tippy";

const MessageTable = () => {
  const [messageData, setMessageData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState([]);

  const [pageLength, setPageLength] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const toggleMessageExpansion = (index) => {
    if (expandedMessages.includes(index)) {
      setExpandedMessages(expandedMessages.filter((item) => item !== index));
    } else {
      setExpandedMessages([...expandedMessages, index]);
    }
  };

  const toggle = () => {
    setModal(!modal);
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/message/get?page=${page}&limit=${pageLength}&search=${search}`,
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoader(false);
      toast.error('Something went wrong. Try again later.');
    } else {
      setLoader(false);
      setMessageData(promiseToken.response.ResponseBody.docs);
      setTotalPages(promiseToken.response.ResponseBody.totalPages);
    }
  };
  useEffect(() => {
    getData();
  }, [search, page, pageLength]);

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

  
  const changePagePerItem = (e) => {
    const newPageLength = parseInt(e.target.value, 10);
    const currentTotalItems = pageLength * (page - 1) + 1; // Calculate the current total items
    const newPage = Math.ceil(currentTotalItems / newPageLength);
  
    setPageLength(newPageLength);
    setPage(newPage);
  }

  const containerStyle = {
    zIndex: 1999,
  };

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
            <div className="overflow-scroll scroll-bar-1">
              <table className="table-3 -border-bottom col-12">
                <thead className="bg-light-2">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th style={{ textAlign: "center" }}>Message</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loader === true ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        <Spinner color="primary"></Spinner>
                      </td>
                    </tr>
                  ) : messageData.length < 1 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        No Message found
                      </td>
                    </tr>
                  ) : (
                    messageData.map((item, index) => {
                      return (
                        <>
                          <tr key={index + 6}>
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                            <td>{item.subject}</td>
                            <td style={{ width: "40%" }}>
                              {expandedMessages.includes(index) ? (
                                <>
                                  {item.message}
                                  {item.message.length > 100 && (
                                    <>
                                      &nbsp;
                                      <button
                                        style={{ color: "blue" }}
                                        onClick={() =>
                                          toggleMessageExpansion(index)
                                        }
                                      >
                                        Read Less
                                      </button>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  {item.message.slice(0, 100)}
                                  {item.message.length > 100 && (
                                    <>
                                      &nbsp;
                                      <button
                                        style={{ color: "blue" }}
                                        onClick={() =>
                                          toggleMessageExpansion(index)
                                        }
                                      >
                                        Read More
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                            </td>
                            <td>
                              {moment(item.createdAt).format("MMM Do YYYY")}
                            </td>
                            <td>
                              <Tooltip
                                title="Answer this query"
                                position="bottom"
                                arrow={true}
                                distance={15}
                                trigger="mouseenter"
                              >
                                <FaRegEnvelope
                                  className="iconcolor"
                                  onClick={(e) => {
                                    window.location.href = `mailto:${item.email}`;
                                    e.preventDefault();
                                  }}
                                  size="25"
                                />
                              </Tooltip>
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
            <select
              // onChange={(e) => {
              //   setPageLength(e.target.value);
              // }}
              onChange={changePagePerItem}
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
    </>
  );
};

export default MessageTable;
