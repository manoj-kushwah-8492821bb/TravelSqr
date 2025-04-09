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

const Faqs = () => {
  const [faqsData, setFaqsData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState(null);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState([]);
  const [expandedMessagesA, setExpandedMessagesA] = useState([]);

  const toggle = () => {
    setModal(!modal);
    formik.resetForm();
    setData(null);
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/get_faq`,
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoader(false);
      toast.error("Something went wrong. Try again later.");
    } else {
      setLoader(false);
      setFaqsData(promiseToken.response.ResponseBody);
    }
  };
  useEffect(() => {
    getData();
  }, [status]);

  const containerStyle = {
    zIndex: 1999,
  };

  const initialValues = {
    question: data?.question,
    answer: data?.answer,
  };
  const validationSchema = Yup.object({
    question: Yup.string()
      .required("Question Field is Required")
      .matches(/^\S+(?:\s\S+)*$/,"Only allowed single space between words, and no spaces at the beginning or end")
      .min(10, "Question must be at least 10 characters")
      .max(250, "Question must be at most 250 characters"),
    answer: Yup.string()
      .required("Answer Field is Required")
      .matches(/^\S+(?:\s\S+)*$/,"Only allowed single space between words, and no spaces at the beginning or end")
      .min(10, "Answer must be at least 10 characters")
      .max(500, "Answer must be at most 500 characters"),
  });

  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    let data = {
      question: values.question,
      answer: values.answer,
    };
    let api = "";
    if (id != "") {
      //console.log(id);
      data.faq_id = id;
      api = "admin/update_faq";
    } else {
      api = "admin/add_faq";
    }
    //console.log(data);
    const promise = await requestToken(
      api,
      data,
      "post",
      localStorage.getItem("token")
    );

    if (promise.error) {
      toast.error('Something went wrong. Try again later.');
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
        const newData = { faq_id: data._id };
        dataDelete(newData);
      }
    });
  };
  const dataDelete = async (newData) => {
    const promise = await requestToken(
      "admin/delete_faq",
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
                <div class="row" style={{paddingBottom:'25px'}}>
                  <div class="col-sm">
                  </div>
                  <div class="col-sm">
                    <Tooltip
                      title="Add FAQ"
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
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loader === true ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}>
                        <Spinner color="primary"></Spinner>
                      </td>
                    </tr>
                  ) : faqsData.length < 1 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}>
                        No faq found
                      </td>
                    </tr>
                  ) : (
                    faqsData.map((item, index) => {
                      return (
                        <>
                          <tr key={index + 1}>
                          <td style={{ width: "40%" }}>
                              {expandedMessages.includes(index) ? (
                                <>
                                  {item.question}
                                  {item.question.length > 100 && (
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
                                  {item.question.slice(0, 100)}
                                  {item.question.length > 100 && (
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
                            <td style={{ width: "40%" }}>
                              {expandedMessagesA.includes(index) ? (
                                <>
                                  {item.answer}
                                  {item.answer.length > 100 && (
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
                                  {item.answer.slice(0, 100)}
                                  {item.answer.length > 100 && (
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
                              <Tooltip
                                title="Edit FAQ"
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
                                title="Delete FAQ"
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
            {id == "" ? "Add FAQ" : "Edit FAQ"}
          </ModalHeader>
          <ModalBody>
            <div className="row y-gap-20">
              <div className="col-12">
                <div className="form-input ">
                  <span class="input-group-addon">
                    <i class="glyphicon glyphicon-user"></i>
                  </span>
                  <textarea name="question" rows={5} cols={10} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.question} />
                  <label className="lh-1 text-14 text-light-1">Question</label>
                </div>
                {formik.touched.question && formik.errors.question && (
                  <span className="text-danger">{formik.errors.question}</span>
                )}
              </div>
              {/* End .col */}

              <div className="col-12">
                <div className="form-input ">
                  <textarea name="answer" rows={5} cols={10} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.answer} />
                  <label className="lh-1 text-14 text-light-1">Answer</label>
                </div>
                {formik.touched.answer && formik.errors.answer && (
                  <span className="text-danger">{formik.errors.answer}</span>
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
                    {id == "" ? "Add FAQ" : "Save Changes"}{" "}
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

export default Faqs;
