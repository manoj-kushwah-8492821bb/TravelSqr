"use client";
import { useState, useEffect } from "react";
//import Pagination from "../../common/Pagination";
//import ActionsButton from "./ActionsButton";
import { getRequestToken, requestToken } from "../../../../api/Api";

import toast from "react-hot-toast";

import swal from "sweetalert";
import { FaXmark } from "react-icons/fa6";

import { FaEdit, FaEye, FaRegPlusSquare } from "react-icons/fa";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import { Spinner } from "reactstrap";

import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";

import { useFormik } from "formik";
import * as Yup from "yup";

const Airlines = () => {
  const [airlineData, setAirlineData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState(null);
  const [id, setId] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState(false);

  const [pageLength, setPageLength] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const toggle = () => {
    setModal(!modal);
    formik.resetForm();
    setData(null);
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/airlines?page=${page}&limit=${pageLength}&search=${search}`,
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoader(false);
      toast.error("Something went wrong. Try again later.");
    } else {
      setLoader(false);
      setAirlineData(promiseToken.response.ResponseBody.docs);
      setTotalPages(promiseToken.response.ResponseBody.totalPages);
    }
  };
  useEffect(() => {
    getData();
  }, [search, page, pageLength, status]);

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

  const initialValues = {
    name: data?.name,
    code: data?.code,
  };
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name Field is Required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 25 characters"),
    code: Yup.string()
      .required("Code is required")
      .matches(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters are allowed")
      .min(2, "Code must be at least 2 characters")
      .max(25, "Code must be at most 25 characters"),
  });

  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    let data = {
      name: values.name,
      code: values.code,
    };
    let api = "";
    if (id != "") {
      //console.log(id);
      data.airline_id = id;
      api = "admin/airlines/update";
    } else {
      api = "admin/airlines/add";
    }
    //console.log(data);
    const promise = await requestToken(
      api,
      data,
      "post",
      localStorage.getItem("token")
    );

    if (promise.error) {
      //toast.error(promise.error.response.data.ResponseMessage);
      setLoading(false);
    } else {
      if (promise.response.succeeded === true) {
        if (id == "") {
          setSearchData("");
          setSearch("");
        }
        toast.success(promise.response.ResponseMessage);
        setModal(false);
        resetForm();
        setLoading(false);
        if (status == true) {
          setStatus(false);
        } else {
          setStatus(true);
        }
        setData(null);
      } else {
        toast.error(promise.response.ResponseMessage);
        setLoading(false);
      }
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema,
  });
  const onEdit = (item) => {
    setModal(true);
    setData(item);
    setId(item._id);
  };
  const onDelete = (data) => {
    swal({
      title: `Are you sure you want to delete ${data?.name}?`,
      //text: `Are you sure you want to delete ${data?.username}?`,
      icon: "warning",
      buttons: {
        cancel: {
          text: "No",
          value: null,
          visible: true,
          className: "swal-button--cancel", // Apply a class for styling
        },
        confirm: {
          text: "Yes",
          value: true,
          visible: true,
          className: "swal-button--confirm", // Apply a class for styling
        },
      },
      dangerMode: true,
      closeOnClickOutside: false,
    }).then((willDelete) => {
      if (willDelete) {
        const newData = { airline_id: data._id };
        dataDelete(newData);
      }
    });
  };
  const dataDelete = async (newData) => {
    const promise = await requestToken(
      "admin/airlines/delete",
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
        if (status == true) {
          setStatus(false);
        } else {
          setStatus(true);
        }
      } else {
        toast.error(promise.response.ResponseMessage);
      }
    }
  };
  const searchValue = (e) => {
    if (e.target.value.length > 2 || e.target.value.length === 0) {
      setSearch(e.target.value);
    }
    setSearchData(e.target.value);
    setPage(1);
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
        <div className="tabs__content pt-30 js-tabs-content">
          <div className="tabs__pane -tab-item-1 is-tab-el-active">
            <div className="overflow-scroll scroll-bar-1">
              <div style={{ float: "right", paddingRight: "60px" }}>
                <div class="row">
                  <div class="col-sm">
                    <div className="single-field relative d-flex items-center py-10">
                      <input
                        className="pl-10 border-light text-dark-1 h-50 rounded-8"
                        type="text"
                        placeholder="Search by airline name"
                        size="35"
                        style={{ width: "auto" }}
                        onChange={searchValue}
                        value={searchData}
                      />
                    </div>
                  </div>
                  <div class="col-sm">
                    <Tooltip
                      title="Add Airline"
                      position="bottom"
                      arrow={true}
                      distance={15}
                      trigger="mouseenter"
                    >
                      <FaRegPlusSquare
                        className="iconcoloradd"
                        onClick={() => {
                          setModal(true);
                          setData(null);
                          setId("");
                        }}
                        size="25"
                        tooltip=""
                      ></FaRegPlusSquare>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <table className="table-3 -border-bottom col-12">
                <thead className="bg-light-2">
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loader === true ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center" }}>
                        <Spinner color="primary"></Spinner>
                      </td>
                    </tr>
                  ) : airlineData.length < 1 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}>
                        No content found
                      </td>
                    </tr>
                  ) : (
                    airlineData.map((item, index) => {
                      return (
                        <>
                          <tr key={index + 1}>
                            <td>{item.name}</td>
                            <td>{item.code}</td>
                            <td>
                              <Tooltip
                                title="Edit Airline"
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
                                title="Delete Airline"
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
      {/* Model */}
      <Modal isOpen={modal} toggle={toggle} size="l" backdrop={true}>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader toggle={toggle}>
            {id == "" ? "Add Airline" : "Edit Airline"}
          </ModalHeader>
          <ModalBody>
            <div className="row y-gap-20">
              <div className="col-12">
                <div className="form-input ">
                  <span class="input-group-addon">
                    <i class="glyphicon glyphicon-user"></i>
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <label className="lh-1 text-14 text-light-1">Name</label>
                </div>
                {formik.touched.name && formik.errors.name && (
                  <span className="text-danger">{formik.errors.name}</span>
                )}
              </div>
              {/* End .col */}

              <div className="col-12">
                <div className="form-input ">
                  <input
                    type="text"
                    name="code"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={id != ""}
                  />
                  <label className="lh-1 text-14 text-light-1">Code</label>
                </div>
                {formik.touched.code && formik.errors.code && (
                  <span className="text-danger">{formik.errors.code}</span>
                )}
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
                    <Spinner></Spinner>&nbsp;Loading...
                  </>
                ) : (
                  <>
                    {id == "" ? "Add Airline" : "Save Changes"}{" "}
                    <div className="icon-arrow-top-right ml-15" />
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

export default Airlines;
