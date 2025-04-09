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

import { useFormik } from "formik";

import Select from "react-select";

const Coupon = () => {

  const [couponData, setCouponData] = useState([]);  // Stores coupon list
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
  
  const [editId, setEditId] = useState(null);

  // State for adding or editing coupons
  const [addData, setAddData] = useState({
    code: "",
    discountValue: "",
    discountType: "percentage",
    expirationDate: "",
    codeError: "",
    discountError: ""
  });
  

  const [errors, setErrors] = useState({});

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



  // const formik = useFormik({
  //   enableReinitialize: true,
  //   initialValues,
  //   onSubmit,
  //   validateOnChange: true,
  //   validateOnBlur: true,
  //   validationSchema,
  // });

 
  const discountTypeOptions = [
    { value: "percentage", label: "Percentage" },
    { value: "flat", label: "Flat Amount" },
  ];

  // Handle input field changes
  const handleChange = (e) => {
    setAddData({ ...addData, [e.target.name]: e.target.value });
  };

  // Handle discount type selection
  const handleSelectChange = (selectedOption) => {
    setAddData({ ...addData, discountType: selectedOption });
  };

  // Validate the form before submission
  const validateForm = () => {
    let errors = {};
    if (!addData.couponCode) errors.couponCode = "Coupon Code is required";
    if (!addData.discountValue) errors.discountValue = "Discount Value is required";
    if (!addData.expirationDate) errors.expirationDate = "Expiration Date is required";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/coupons?page=${page}&limit=${pageLength}&search=${search}`,
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoader(false);
      toast.error('Something went wrong. Try again later.');
    } else {
      setLoader(false);
      setCouponData(promiseToken.response.ResponseBody.docs);
      setTotalPages(promiseToken.response.ResponseBody.totalPages);
    }
  };
  useEffect(() => {
    getData();
  }, [search, page, pageLength, status]);

  // Handle Form Submission (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const couponData = {
      couponCode: addData.couponCode,
      discountValue: Number(addData.discountValue),
      discountType: addData.discountType.value,
      expirationDate: addData.expirationDate,
    };

    try {
      const apiEndpoint = editId ? `admin/coupons/update` : `admin/coupons/add`;

      // Ensure ID is included only when editing
      const updatedCouponData = editId ? { ...couponData, coupon_id: editId } : couponData;
          
      const token = localStorage.getItem("token");
      const result = await requestToken(apiEndpoint, updatedCouponData, "post", token);
    
      if (result.response?.succeeded) {
        toast.success(result.response.ResponseMessage);
        getData(); // Refresh list
        resetForm();
      } else {
        toast.error(result.response?.ResponseMessage || "Failed to save coupon.s");
      }
    } catch (error) {
      toast.error("Error saving coupon.z");
    }
    

    setLoading(false);
  };


  const onEdit = (item) => {
    setEditId(item._id);
    setAddData({
      couponCode: item.couponCode,
      discountValue: item.discountValue,
      expirationDate: item.expirationDate,
      discountType: {
        value: item.discountType,
        label: item.discountType === "percentage" ? "Percentage" : "Fixed"
      }
    });
    setModal(true);
  };
  

  const onDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
  
    const newData = { coupon_id: couponId };
  
    try {
      const promise = await requestToken(
        "admin/coupons/delete",
        newData,
        "post",
        localStorage.getItem("token")
      );
  
      if (promise.error) {
        toast.error("Something went wrong. Try again later.");
      } else {
        if (promise.response.succeeded === true) {
          setSearchData("");
          setSearch("");
          toast.success(promise.response.ResponseMessage);
          
          // Toggle status to trigger a refresh
          setStatus((prevStatus) => !prevStatus);
        } else {
          toast.error(promise.response.ResponseMessage);
        }
      }
    } catch (error) {
      console.error("Delete Coupon Error:", error);
      toast.error("Error deleting coupon. Please try again.");
    }
  };
  

    // Reset Form
    const resetForm = () => {
      setAddData({
        couponCode: "",
        discountValue: "",
        discountType: discountTypeOptions[0],
        expirationDate: "",
      });
      setEditId(null);
      setErrors({});
    };


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
                        placeholder="Search by coupon code"
                        size="35"
                        style={{ width: "auto" }}
                        onChange={searchValue}
                        value={searchData}
                      />
                    </div>
                  </div>
                  <div className="col-sm">
                    <Tooltip
                      title="Add Coupon"
                      position="bottom"
                      arrow={true}
                      distance={15}
                      trigger="mouseenter"
                    >
                      <FaRegPlusSquare
                        className="iconcoloradd"
                        onClick={() => {
                          setModal(true);
                          setAddData({
                            ...addData,
                            couponCode: "",
                            discountValue: "",
                            expirationDate: "",
                            discountType: { value: "percentage", label: "Percentage" },
                          });
                          setId("");
                        }}
                        size="25"
                      ></FaRegPlusSquare>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <table className="table-3 -border-bottom col-12">
                <thead className="bg-light-2">
                  <tr>
                    <th>Coupon Code</th>
                    <th>Discount</th>
                    <th>Expiration Date</th>
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
                  ) : couponData.length < 1 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        No coupons found
                      </td>
                    </tr>
                  ) : (
                    couponData.map((item, index) => {
                      return (
                        <tr key={index + 1}>
                          <td>{item.couponCode}</td>
                          <td>
                            {item.discountValue} {item.discountType === "percentage" ? "%" : "$"}
                          </td>
                          <td>{item.expirationDate}</td>
                          <td>
                            <Tooltip
                              title="Edit Coupon"
                              position="bottom"
                              arrow={true}
                              distance={15}
                              trigger="mouseenter"
                            >
                              <FaEdit
                                className="iconcolor"
                                onClick={() => {
                                  onEdit(item);
                                }}
                                size="25"
                              ></FaEdit>
                            </Tooltip>{" "}
                            <Tooltip
                              title="Delete Coupon"
                              position="bottom"
                              arrow={true}
                              distance={15}
                              trigger="mouseenter"
                            >
                              <FaXmark
                                className="iconcolor"
                                onClick={() => {
                                  onDelete(item);
                                }}
                                size="25"
                              ></FaXmark>
                            </Tooltip>
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

      {/* Model */}
      <Modal isOpen={modal} toggle={toggle} size="l" backdrop={true}>
      <form onSubmit={handleSubmit}>
      <ModalHeader toggle={toggle}>
        {id === "" ? "Add Coupon" : "Edit Coupon"}
      </ModalHeader>

      <ModalBody>
        <div className="row y-gap-20">
          <div className="col-12">
            <div className="form-input">
              <input
                type="text"
                name="couponCode"
                value={addData.couponCode}
                onChange={handleChange}
                maxLength={20}
              />
              <label className="lh-1 text-14 text-light-1">Coupon Code</label>
            </div>
            <span className="text-danger">{errors.couponCode}</span>
          </div>

          <div className="col-12">
            <div className="form-input">
              <input
                type="number"
                name="discountValue"
                value={addData.discountValue}
                onChange={handleChange}
              />
              <label className="lh-1 text-14 text-light-1">Discount Value</label>
            </div>
            <span className="text-danger">{errors.discountValue}</span>
          </div>

          <div className="col-12">
            <label className="lh-1 text-16 text-light-1">Discount Type</label>
            <Select
              options={discountTypeOptions}
              value={addData.discountType}
              onChange={handleSelectChange}
              className="selectFull"
            />
          </div>

          <div className="col-12">
            <div className="form-input">
              <input
                type="date"
                name="expirationDate"
                value={addData.expirationDate}
                onChange={handleChange}
              />
              <label className="lh-1 text-14 text-light-1">Expiration Date</label>
            </div>
            <span className="text-danger">{errors.expirationDate}</span>
          </div>

        </div>
      </ModalBody>

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
    </form>
      </Modal>
    </>
  );
};

export default Coupon;
