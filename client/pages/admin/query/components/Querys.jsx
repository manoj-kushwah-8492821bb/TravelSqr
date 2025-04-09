"use client";

import { useState, useEffect, useMemo } from "react";
import { getRequestToken, requestToken } from "../../../../api/Api";

import toast from "react-hot-toast";

import { FaXmark } from "react-icons/fa6";

import { FaEdit, FaEye, FaRegPlusSquare } from "react-icons/fa";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import { Spinner } from "reactstrap";

import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";

const Querys = () => {

  const [queryData, setQueryData] = useState([]);  // Stores coupon list
  const [remarks, setRemarks] = useState({});
  const [loader, setLoader] = useState(true);  // Controls loading state
  const [data, setData] = useState(null);  // Holds selected coupon data for editing
  const [id, setId] = useState("");  // Stores coupon ID
  const [loading, setLoading] = useState(false);  // Tracks loading state for actions
  const [modal, setModal] = useState(false);  // Controls coupon modal visibility
  const [status, setStatus] = useState(false);  // Tracks coupon status (e.g., active/inactive)
  
  const [pageLength, setPageLength] = useState(10);  // Items per page
  const [page, setPage] = useState(1);  // Current page number
  const [search, setSearch] = useState("");  // Search query input
  const [searchData, setSearchData] = useState("");  // Processed search data
  const [totalPages, setTotalPages] = useState(0);  // Total number of pages

  const toggle = () => {
    setData(null);
    setModal(!modal);
  };

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
  };

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

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `user/all-queries?page=${page}&limit=${pageLength}&search=${search}`,
      {},
      "get",
      localStorage.getItem("token")
    );
    console.log("promisex_:", promiseToken)
    if (promiseToken.error) {
      setLoader(false);
      toast.error('Something went wrong. Try again later.');
    } else {
      setLoader(false);
      setQueryData(promiseToken.response.ResponseBody.docs);
      setTotalPages(promiseToken.response.ResponseBody.totalPages);
    }
  };

  const onStatusChange = async (item) => {
    const confirmChange = window.confirm("Are you sure you want to mark this query as completed?");
    if (!confirmChange) return;
  
    if (item.status === "Completed") {
      alert("Query is already completed.");
      return;
    }
  
    const remark = remarks[item._id] || ""; // Get remark for the specific query
    if (!remark) {
      alert("Please add a remark before completing the query.");
      return;
    }
  
    setLoading(true);
    try {
      const promise = await requestToken(
        `user/update-query-status/${item._id}`,
        { status: "Completed", remark }, // ✅ Include remark in request payload
        "post",
        localStorage.getItem("token")
      );

  
      if (promise.response.query.status === "Completed") {
        toast.success("Query marked as completed!");
        getData(); // Refresh the query list
      } else {
        toast.error("Failed to update status. Try again!");
      }
      
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    getData();
  }, [search, page, pageLength, status]);

  const searchValue = (e) =>{
    if(e.target.value.length>2 || e.target.value.length==0){
      setSearch(e.target.value);
    }
    setSearchData(e.target.value);
    setPage(1);
  }

  const changePagePerItem = (e) => {
    const newPageLength = parseInt(e.target.value, 10);
    const currentTotalItems = pageLength * (page - 1) + 1; // Calculate the current total items
    const newPage = Math.ceil(currentTotalItems / newPageLength);
  
    setPageLength(newPageLength);
    setPage(newPage);
  }
  return (
    <>
    
      <div className="tabs -underline-2 js-tabs">
        <div className="tabs__content pt-30 js-tabs-content">
          <div className="tabs__pane -tab-item-1 is-tab-el-active">
            <div className="overflow-scroll scroll-bar-1">
              <div style={{ float: "right", paddingRight: "60px" }}>
                <div className="row">
                  <div className="col-sm">
                    <div className="single-field relative d-flex items-center py-10">
                      <input
                        className="pl-10 border-light text-dark-1 h-50 rounded-8"
                        type="text"
                        placeholder="Search by Query"
                        size="35"
                        style={{ width: "auto" }}
                        onChange={searchValue}
                        value={searchData}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <table className="table-3 -border-bottom col-12">
                <thead className="bg-light-2">
                    <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>PhoneNo</th>
                    <th>Query Message</th>
                    <th>Date</th>
                    <th>Remark</th>
                    <th>Status</th>
    
                    </tr>
                </thead>
                <tbody>
                    {loading === true ? (
                    <tr>
                        <td colSpan={6} style={{ textAlign: "center" }}>
                        <Spinner color="primary" />
                        </td>
                    </tr>
                    ) : queryData.length < 1 ? (
                    <tr>
                        <td colSpan={6} style={{ textAlign: "center" }}>
                        No queries found
                        </td>
                    </tr>
                    ) : (
                    queryData.map((item, index) => {
                        return (
                        <tr key={index + 1}>
                            <td>{item.name || 'N/A'}</td>
                            <td>{item.email || 'N/A'}</td>
                            <td>{item.phone || 'N/A'}</td>
                            <td>{item.message || 'N/A'}</td>
                            <td>{new Date(item.createdAt).toLocaleString()}</td>

                            <td>
                                {item.status === "Completed" ? (
                                item.remark // Show saved remark
                                ) : (
                                <input
                                    type="text"
                                    placeholder="Enter remark"
                                    value={remarks[item._id] || ""}
                                    onChange={(e) =>
                                    setRemarks({ ...remarks, [item._id]: e.target.value })
                                    }
                                />
                                )}
                            </td>

                            <td>
                                {item.status === "Completed" ? (
                                    <span className="badge bg-success">Completed</span>
                                ) : (
                                    <button
                                    className="btn btn-warning"
                                    onClick={() => onStatusChange(item)}
                                    disabled={item.status === "Completed"}
                                    >
                                    Pending
                                    </button>
                                )}
                            </td>
                        </tr>
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

      {/* Model */}
      <Modal isOpen={modal} toggle={toggle} size="l" backdrop={true}>
    

      <ModalFooter>
        <div className="col-12">
          <button
            type="submit"
            className="button py-20 -dark-1 bg-blue-1 text-white w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner /> &nbsp;Loading...
              </>
            ) : (
              <>
                {id === "" ? "Add Coupon" : "Save Changes"} <div className="icon-arrow-top-right ml-15" />
              </>
            )}
          </button>
        </div>
      </ModalFooter>
      </Modal>
    </>
  );
};

export default Querys;
