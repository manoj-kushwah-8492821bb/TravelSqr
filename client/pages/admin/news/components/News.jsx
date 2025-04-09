"use client";

import { useState } from "react";
import { requestToken } from "../../../../api/Api";
import toast from "react-hot-toast";
import { FaRegPlusSquare } from "react-icons/fa";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "reactstrap";
import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";

const News = () => {
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addData, setAddData] = useState({ subject: "", message: "" });
  const [errors, setErrors] = useState({});

  const toggle = () => {
    setModal(!modal);
    resetForm();
  };

  const handleChange = (e) => {
    setAddData({ ...addData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let errors = {};
    if (!addData.subject) errors.subject = "Subject is required";
    if (!addData.message) errors.message = "Message is required";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log("addData_:", addData);
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const result = await requestToken(
        "admin/news/send-newsletter",
        addData,
        "post",
        token
      );

      if (result.response?.succeeded) {
        toast.success(result.response.ResponseMessage);
        toggle();
      } else {
        toast.error(result.response?.ResponseMessage || "Failed to add news.");
      }
    } catch (error) {
      toast.error("Error adding news.");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setAddData({ subject: "", message: "" });
    setErrors({});
  };

  return (
    <>
      <div className="tabs__content pt-30">
        <div className="tabs__pane is-tab-el-active">
          <div className="overflow-scroll scroll-bar-1">
            <button
              type="submit"
              onClick={toggle}
              className="button px-30 fw-400 text-14 border-dark-4 -blue-1 h-50 text-dark-4 ml-20"
              disabled={loading}
            >
              Push Updates To All Users
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={modal} toggle={toggle} size="l" backdrop={true}>
        <form onSubmit={handleSubmit}>
          <ModalHeader toggle={toggle}>Add News</ModalHeader>
          <ModalBody>
            <div className="row y-gap-20">
              <div className="col-12">
                <div className="form-input">
                  <input
                    type="text"
                    name="subject"
                    value={addData.subject}
                    onChange={handleChange}
                    maxLength={20}
                  />
                  <label className="lh-1 text-14 text-light-1">Subject</label>
                </div>
                <span className="text-danger">{errors.subject}</span>
              </div>
              <div className="col-12">
                <div className="form-input">
                  <input
                    type="text"
                    name="message"
                    value={addData.message}
                    onChange={handleChange}
                  />
                  <label className="lh-1 text-14 text-light-1">Message</label>
                </div>
                <span className="text-danger">{errors.message}</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              type="submit"
              className="button py-20 bg-blue-1 text-white w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner /> &nbsp;Loading...
                </>
              ) : (
                "Add News"
              )}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default News;
