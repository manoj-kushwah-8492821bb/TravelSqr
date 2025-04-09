"use client";
import { useState, useEffect } from "react";
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

import { Spinner } from "reactstrap";

import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import { BASE_URL_IMG } from "../../../../config";

const Testimonial = () => {
  const [TestimonialData, setTestimonialData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState(null);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState([]);
  const [expandedMessagesA, setExpandedMessagesA] = useState([]);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profilePic, setProfilePic] = useState({});
  // const [profilePic1, setProfilePic1] = useState({});

  const toggle = () => {
    setModal(!modal);
    formik.resetForm();
    setData(null);
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/feedback/get`,
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoader(false);
      toast.error("Something went wrong. Try again later.");
    } else {
      setLoader(false);
      setTestimonialData(promiseToken.response.ResponseBody);
    }
  };
  useEffect(() => {
    getData();
  }, [status]);

  const containerStyle = {
    zIndex: 1999,
  };

  const initialValues = {
    profilePic:'',
    name: data?.name,
    email: data?.email,
    mobile: data?.mobile,
    feedback: "",
  };
  const validationSchema = Yup.object({
    profilePic: Yup.mixed().required('Image is required'),
    name: Yup.string()
      .required("Name is required")
      .matches(/^(?!.* {2})/, 'Multiple spaces are not allowed')
      .min(2, "name must be at least 2 characters")
      .max(25, "name must be at most 25 characters"),
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
    feedback: Yup.string()
      .required("Feedback Field is Required")
      .matches(
        /^\S+(?:\s\S+)*$/,
        "Only allowed single space between words, and no spaces at the beginning or end"
      )
      .min(10, "Feedback must be at least 10 characters")
      .max(500, "Feedback must be at most 500 characters"),
  });
  // const validationSchema = Yup.object({
  //   question: Yup.string()
  //     .required("Question Field is Required")
  //     .matches(
  //       /^\S+(?:\s\S+)*$/,
  //       "Only allowed single space between words, and no spaces at the beginning or end"
  //     )
  //     .min(10, "Question must be at least 10 characters")
  //     .max(250, "Question must be at most 250 characters"),
  //   answer: Yup.string()
  //     .required("Answer Field is Required")
  //     .matches(
  //       /^\S+(?:\s\S+)*$/,
  //       "Only allowed single space between words, and no spaces at the beginning or end"
  //     )
  //     .min(10, "Answer must be at least 10 characters")
  //     .max(500, "Answer must be at most 500 characters"),
  // });
  const handleImageChange = (e) => {
    //setProfilePic1(e.target.files[0]);
    setProfilePic(e.target.files[0]);
    const file = e.target.files[0];
    const reader = new FileReader();

    if (!file) {
      formik.setFieldError("profilePic", "Please select an image.");
      setError("Please select an image.");
      setSuccess(false);
      setProfilePic("");
      return;
    }

    // if (file.size > 800 * 1024) {
    //   formik.setFieldError("profilePic", "Image must be smaller than 800KB.");
    //   setError("Image must be smaller than 800KB.");
    //   setSuccess(false);
    //   setProfilePic("");
    //   return;
    // }

    if (!file.type.startsWith("image/")) {
      formik.setFieldError("profilePic", "Only image files is allowed.");
      setError("Only image files is allowed.");
      setSuccess(false);
      setProfilePic("");
      return;
    }

    reader.onload = () => {
      setImage(reader.result);
      formik.setFieldError("profilePic", "");
      formik.setFieldValue("profilePic", e.target.files[0]);
      setSuccess(true);
      setError("");
    };

    reader.readAsDataURL(file);
  };

  //console.log("image", profilePic);
  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    // console.log("click", profilePic);
    const formData = new FormData();
    formData.append("user_name", values.name);
    formData.append("user_mobile", values.mobile);
    formData.append("user_email", values.email);
    formData.append("feedback", values.feedback);
    //if (profilePic != "") {
      formData.append("profile_pic", profilePic);
    //}
    // let data = {
    //   user_name: values.question,
    //   user_mobile: values.answer,
    //   user_email: values.email,
    //   feedback: values.feedback,
    // };
    // let api = "";
    // if (id != "") {
    //   //console.log(id);
    //   data.faq_id = id;
    //   api = "admin/update_faq";
    // } else {
    //   api = "admin/add_faq";
    // }
    //console.log(data);
    const promise = await requestTokenUpload(
      "admin/feedback/add",
      formData,
      "post",
      localStorage.getItem("token")
    );

    // console.log("🚀 ~ onSubmit ~ promise:", promise);
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
      title: `Are you sure you want to delete this question?`,
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
        const newData = { feedback_id: data._id };
        dataDelete(newData);
      }
    });
  };
  const dataDelete = async (newData) => {
    const promise = await requestToken(
      "admin/feedback/delete",
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
  };
  const toggleMessageExpansionA = (index) => {
    if (expandedMessagesA.includes(index)) {
      setExpandedMessagesA(expandedMessagesA.filter((item) => item !== index));
    } else {
      setExpandedMessagesA([...expandedMessagesA, index]);
    }
  };
  const toggleMessageExpansion = (index) => {
    if (expandedMessages.includes(index)) {
      setExpandedMessages(expandedMessages.filter((item) => item !== index));
    } else {
      setExpandedMessages([...expandedMessages, index]);
    }
  };
  // console.log("🚀 ~ Testimonial ~ TestimonialData:", TestimonialData);

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
                <div class="row" style={{ paddingBottom: "25px" }}>
                  <div class="col-sm"></div>
                  <div class="col-sm">
                    <Tooltip
                      title="Add Testimonial"
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
                          setImage('');
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
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Feedback</th>
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
                  ) : TestimonialData.length < 1 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        No Testimonial Found
                      </td>
                    </tr>
                  ) : (
                    TestimonialData.map((item, index) => {
                      return (
                        <>
                          <tr key={index + 1}>
                            <td>
                              <img
                                src={BASE_URL_IMG + item?.profile_pic}
                                style={{ height: "50px", borderRadius: "50%" }}
                              />
                            </td>
                            <td>{item?.user_name}</td>
                            <td>{item?.user_mobile}</td>
                            <td>{item?.user_email}</td>
                            <td style={{ width: "40%" }}>
                              {expandedMessagesA.includes(index) ? (
                                <>
                                  {item?.feedback}
                                  {item?.feedback.length > 100 && (
                                    <>
                                      &nbsp;
                                      <button
                                        style={{ color: "blue" }}
                                        onClick={() =>
                                          toggleMessageExpansionA(index)
                                        }
                                      >
                                        Read Less
                                      </button>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  {item?.feedback.slice(0, 100)}
                                  {item?.feedback.length > 100 && (
                                    <>
                                      &nbsp;
                                      <button
                                        style={{ color: "blue" }}
                                        onClick={() =>
                                          toggleMessageExpansionA(index)
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
                              {/* <Tooltip
                                title="Edit Faq"
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
                              </Tooltip>{" "} */}
                              <Tooltip
                                title="Delete Testimonial"
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
      <Modal isOpen={modal} toggle={toggle} size="l" backdrop={true}>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader toggle={toggle}>
            {id == "" ? "Add Testimonial" : "Edit Testimonial"}
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
                {/* <div className="text-14 mt-5">
                  PNG or JPG no bigger than 800px wide and tall.
                </div> */}
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
                {/* {error && !success && (
                  <div className="text-red-1 mt-1">{error}</div>
                )} */}
                {formik.errors.profilePic && (
                  <div className="text-red-1 mt-1">{formik.errors.profilePic}</div>
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
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    tabIndex={2}
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
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    // disabled={true}
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
              <div className="col-12">
                <div className="form-input ">
                  <textarea
                    name="feedback"
                    rows={5}
                    cols={10}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.feedback}
                  />
                  <label className="lh-1 text-14 text-light-1">Feedback</label>
                </div>
                {formik.touched.feedback && formik.errors.feedback && (
                  <span className="text-danger">{formik.errors.feedback}</span>
                )}
              </div>
              {/* End .col */}
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

export default Testimonial;
