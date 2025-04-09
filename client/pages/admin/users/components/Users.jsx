"use client";

import { useState, useEffect, useMemo } from "react";
//import Pagination from "../../common/Pagination";
//import ActionsButton from "./ActionsButton";
import {
  getRequestToken,
  requestToken,
  requestTokenUpload,
} from "../../../../api/Api";

import toast from "react-hot-toast";

import swal from "sweetalert";
import { FaXmark } from "react-icons/fa6";

import { FaEdit, FaEye, FaRegPlusSquare } from "react-icons/fa";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import { Spinner, Badge } from "reactstrap";

import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";
import Image from "next/image";
import { BASE_URL, BASE_URL_IMG } from "../../../../config";

import { useFormik } from "formik";
import * as Yup from "yup";

const Users = () => {
  const [userData, setUserData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState("");
  const [id, setId] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState(false);

  const [pageLength, setPageLength] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const [showPassword, setShowPassword] = useState("password");

  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profilePic, setProfilePic] = useState({});

  const initialValues = {
    first_name: data?.first_name,
    last_name: data?.last_name,
    email: data?.email,
    mobile: data?.mobile,
    password: '',
  };
  const validationSchema = Yup.object({
    first_name: Yup.string()
      .required("First name is required")
      .matches(/^[a-zA-Z]+$/, "Only alphabet are allowed")
      .min(2, "First name must be at least 2 characters")
      .max(25, "First name must be at most 25 characters"),
    last_name: Yup.string()
      .required("Last name is required")
      .matches(/^[a-zA-Z]+$/, "Only alphabet are allowed")
      .min(2, "Last name must be at least 2 characters")
      .max(25, "Last name must be at most 25 characters"),
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Entered email is invalid"
      )
      .required("Email is required"),
    mobile: Yup.string()
      .required("Mobile Field is Required")
      .min(5, "Enter the Valid Mobile Number")
      .max(15, "Enter the Valid Mobile Number"),
    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      )
      .min(8, "Password must be at least 8 characters"),
    // confirmPassword: Yup.string().oneOf(
    //   [Yup.ref("password"), null],
    //   "Passwords must match"
    // ),
  });

  const handleImageChange = (e) => {
    setProfilePic(e.target.files[0]);
    const file = e.target.files[0];
    const reader = new FileReader();

    if (!file) {
      setError("Please select an image.");
      setSuccess(false);
      setProfilePic("");
      return;
    }

    if (file.size > 800 * 1024) {
      setError("Image must be smaller than 800KB.");
      setSuccess(false);
      setProfilePic("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files is allowed.");
      setSuccess(false);
      setProfilePic("");
      return;
    }

    reader.onload = () => {
      setImage(reader.result);
      setSuccess(true);
      setError("");
    };

    reader.readAsDataURL(file);
  };

  const toggle = () => {
    formik.resetForm();
    setModal(!modal);
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/user?page=${page}&limit=${pageLength}&search=${search}&email=${searchEmail}`,
      {},
      "get",
      localStorage.getItem("token")
    );
    console.log("admi_:", promiseToken)
    if (promiseToken.error) {
      setLoader(false);
      toast.error("Something went wrong. Try again later.");
    } else {
      setLoader(false);
      setUserData(promiseToken.response.ResponseBody.docs);
      setTotalPages(promiseToken.response.ResponseBody.totalPages);
    }
  };
  useEffect(() => {
    getData();
  }, [search, searchEmail, page, pageLength, status]);

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

  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const data = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      mobile: values.mobile,
      password: values.password,
    };
    const formData = new FormData();
    formData.append("first_name", values.first_name);
    formData.append("last_name", values.last_name);
    formData.append("email", values.email);
    formData.append("mobile", values.mobile);
    formData.append("password", values.password);

    if (profilePic != "") {
      formData.append("profile_pic", profilePic);
    }

    let api = "";
    if (id != "") {
      formData.append("user_id", id);
      api = "admin/user/update";
    } else {
      api = "admin/user/add";
    }

    const promise = await requestTokenUpload(
      api,
      formData,
      "post",
      localStorage.getItem("token")
    );

    if (promise.error) {
      toast.error("Something went wrong. Try again later.");
      setLoading(false);
    } else {
      if (promise.response.succeeded === true) {
        toast.success(promise.response.ResponseMessage);
        setModal(false);
        resetForm();
        setLoading(false);
        if (status == true) {
          setStatus(false);
        } else {
          setStatus(true);
        }
      } else {
        toast.error(promise.response.ResponseMessage);
        setLoading(false);
      }
    }
    //setData({});
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema,
  });

  const containerStyle = {
    zIndex: 1999,
  };

  const onEdit = (item) => {
    setError('');
    setShowPassword("password");
    setModal(true);
    setData(item);
    setId(item._id);
    if (item.profile_pic.trim() == "") {
      setImage(item.profile_pic);
    } else {
      setImage(`${BASE_URL_IMG}${item.profile_pic}`);
    }
  };
  // const onDelete = (data) => {
  //   swal({
  //     title: `Are you sure you want to delete ${data?.name}?`,
  //     //text: `Are you sure you want to delete ${data?.username}?`,
  //     icon: "warning",
  //     buttons: ["No", "Yes"],
  //     dangerMode: true,
  //     closeOnClickOutside: false,
  //   }).then((willDelete) => {
  //     if (willDelete) {
  //       const newData = { user_id: data._id };
  //       dataDelete(newData);
  //     }
  //   });
  // };
  // const dataDelete = async (newData) => {
  //   const promise = await requestToken(
  //     "admin/users/delete",
  //     newData,
  //     "post",
  //     localStorage.getItem("token")
  //   );

  //   if (promise.error) {
  //     toast.error(promise.error.response.data.ResponseMessage);
  //   } else {
  //     if (promise.response.succeeded === true) {
  //       toast.success(promise.response.ResponseMessage);
  //       if (status == true) {
  //         setStatus(false);
  //       } else {
  //         setStatus(true);
  //       }
  //     } else {
  //       toast.error(promise.response.ResponseMessage);
  //     }
  //   }
  // };

  const statusChanged = async (item) => {
    let data = {
      user_id: item._id,
      status: item.status == 1 ? 2 : 1,
    };
    const promise = await requestToken(
      "admin/user/change_status",
      data,
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
  };
  const searchValue = (e) => {
    if (e.target.value.length > 2 || e.target.value.length == 0) {
      setSearch(e.target.value);
      setPage(1);
    }
  };
  const searchValueEmail = (e) => {
    if (e.target.value.length > 2 || e.target.value.length == 0) {
      setSearchEmail(e.target.value);
      setPage(1);
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
                        placeholder="Search by name"
                        size="35"
                        style={{ width: "auto" }}
                        onChange={searchValue}
                      />
                    </div>
                  </div>
                  <div class="col-sm">
                    <div className="single-field relative d-flex items-center py-10">
                      <input
                        className="pl-10 border-light text-dark-1 h-50 rounded-8"
                        type="text"
                        placeholder="Search by email"
                        size="35"
                        style={{ width: "auto" }}
                        onChange={searchValueEmail}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <table className="table-3 -border-bottom col-12">
                <thead className="bg-light-2">
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Coins</th>
                    <th>Status</th>
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
                  ) : userData.length < 1 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center" }}>
                        No user found
                      </td>
                    </tr>
                  ) : (
                    userData.map((item, index) => {
                      return (
                        <>
                          <tr key={index + 1}>
                            <td>
                              {item.profile_pic == "" ? (
                                <img
                                  src="/img/profile.png"
                                  height="50"
                                  width="50"
                                  className="my-2 round"
                                />
                              ) : (
                                <img
                                  src={`${BASE_URL_IMG}${item.profile_pic}`}
                                  height="50"
                                  width="50"
                                  className="rounded"
                                />
                              )}
                            </td>
                            <td>
                              {item.first_name} {item.last_name}
                            </td>
                            <td>{item.email}</td>
                            <td>{item.mobile}</td>
                            <td>💰 {item.coins || "N/A"}</td>
                            {/* <td>
                              {item.is_verified ? "Verified" : "Unverify"}
                            </td> */}
                            <td>
                              <div className="form-check form-switch d-flex justify-content-center">
                                {item.status === 1 ? (
                                  <input
                                    class="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    defaultChecked={
                                      item.status == 1 ? true : false
                                    }
                                    // value={item.status}
                                    onClick={() => {
                                      statusChanged(item);
                                    }}
                                    //title={item.status==1?"Active":"Inactive"}
                                    style={{ cursor: "pointer" }}
                                  />
                                ) : (
                                  <input
                                    class="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    defaultChecked={
                                      item.status == 1 ? true : false
                                    }
                                    // value={item.status}
                                    onClick={() => {
                                      statusChanged(item);
                                    }}
                                    title={
                                      item.status == 1 ? "Active" : "Inactive"
                                    }
                                    style={{
                                      cursor: "pointer",
                                      backgroundColor: "#FFCCCB",
                                    }}
                                  />
                                )}
                              </div>
                              <div className="d-flex justify-content-center">
                              {item.status == 1 ? (
                                <Badge color="primary">Active</Badge>
                              ) : (
                                <Badge color="danger">Inactive</Badge>
                              )}
                              </div>
                            </td>
                            <td>
                              <Tooltip
                                title="Edit User"
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
            {id == "" ? "Add User" : "Edit User"}
          </ModalHeader>
          <ModalBody>
            <div className="row y-gap-30 items-center">
              <div className="col-sm">
                {image ? (
                  <div className="d-flex ratio ratio-1:1 w-200">
                    <img
                      width={200}
                      height={200}
                      src={image}
                      alt="avatar"
                      className="img-ratio rounded-4"
                    />
                    {/* <div className="d-flex justify-end px-10 py-10 h-100 w-1/1 absolute">
                      <div
                        className="size-40 bg-white rounded-4 flex-center cursor-pointer"
                        onClick={() => {
                          setImage(""), setProfilePic("");
                        }}
                      >
                        <i className="icon-trash text-16" />
                      </div>
                    </div> */}
                  </div>
                ) : (
                  <div className="d-flex ratio ratio-1:1 w-200">
                    <Image
                      width={200}
                      height={200}
                      // src={`${BASE_URL}${profileData.profile_pic}`}
                      src="/img/profile.png"
                      alt="image"
                      className="img-ratio rounded-4"
                    />
                    {/* <div className="d-flex justify-end px-10 py-10 h-100 w-1/1 absolute">
                      <div className="size-40 bg-white rounded-4 flex-center cursor-pointer">
                        <i className="icon-trash text-16" />
                      </div>
                    </div> */}
                  </div>
                )}
              </div>

              <div className="col-sm">
                <h4 className="text-16 fw-500">Your avatar</h4>
                <div className="text-14 mt-5">
                  PNG or JPG no bigger than 800px wide and tall.
                </div>
                <div className="d-inline-block mt-15">
                  <label
                    htmlFor="avatar-upload"
                    role="button"
                    className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                  >
                    <i className="icon-upload-file text-20 mr-10" />
                    Browse
                  </label>
                  <input
                    name="profile"
                    type="file"
                    id="avatar-upload"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    tabIndex={1}
                  />
                </div>
                {error && !success && (
                  <div className="text-red-1 mt-1">{error}</div>
                )}
              </div>
            </div>
            <div className="row y-gap-20">
              <div className="col-12">
                <div className="form-input ">
                  <span class="input-group-addon">
                    <i class="glyphicon glyphicon-user"></i>
                  </span>
                  <input
                    type="text"
                    name="first_name"
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    tabIndex={2}
                  />
                  <label className="lh-1 text-14 text-light-1">
                    First Name
                  </label>
                </div>
                {formik.touched.first_name && formik.errors.first_name && (
                  <span className="text-danger">
                    {formik.errors.first_name}
                  </span>
                )}
              </div>
              {/* End .col */}

              <div className="col-12">
                <div className="form-input ">
                  <input
                    type="text"
                    name="last_name"
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    tabIndex={3}
                  />
                  <label className="lh-1 text-14 text-light-1">Last Name</label>
                </div>
                {formik.touched.last_name && formik.errors.last_name && (
                  <span className="text-danger">{formik.errors.last_name}</span>
                )}
              </div>
              {/* End .col */}

              <div className="col-12">
                <div className="form-input ">
                  <input
                    type="text"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={true}
                    tabIndex={4}
                  />
                  <label className="lh-1 text-14 text-light-1">Email</label>
                </div>
                {formik.touched.email && formik.errors.email && (
                  <span className="text-danger">{formik.errors.email}</span>
                )}
              </div>

              {/* End .col */}
              <div className="col-12">
                <div className="form-input ">
                  <input
                    type="number"
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    tabIndex={5}
                  />
                  <label className="lh-1 text-14 text-light-1">Mobile</label>
                </div>
                {formik.touched.mobile && formik.errors.mobile && (
                  <span className="text-danger">{formik.errors.mobile}</span>
                )}
              </div>
              {/* End .col */}

              <div className="col-12">
                <div className="form-input">
                  <input
                    type={showPassword}
                    name="password"
                    // value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    style={{
                      borderRight: "none",
                      width: "85%",
                      borderTopRightRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                    tabIndex={6}
                  />
                  <span className="showPassword" style={{ cursor: "pointer" }}>
                    {showPassword === "text" ? (
                      <img
                        src="/img/icon/eyeOpen.png"
                        width={"60%"}
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
                        tabIndex={7}
                        role="button"
                      />
                    ) : (
                      <img
                        src="/img/icon/eyesClose.png"
                        width={"60%"}
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
                        tabIndex={7}
                        role="button"
                      />
                    )}
                  </span>

                  <label className="lh-1 text-14 text-light-1">Password</label>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <span className="text-danger">{formik.errors.password}</span>
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
                tabIndex={8}
              >
                {loading ? (
                  <>
                    <Spinner></Spinner>&nbsp;Loading...
                  </>
                ) : (
                  <>
                    Save <div className="icon-arrow-top-right ml-15" />
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

export default Users;
