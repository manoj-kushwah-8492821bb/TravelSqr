"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
const QuillNoSSRWrapper = dynamic(import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});

import { useState, useEffect } from "react";
//import Pagination from "../../common/Pagination";
//import ActionsButton from "./ActionsButton";
import { getRequestToken, requestToken } from "../../../../api/Api";

import toast from "react-hot-toast";


import { FaEdit, FaEye, FaRegPlusSquare } from "react-icons/fa";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import { Spinner } from "reactstrap";
import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";

import ReactHtmlParser, {
  processNodes,
  convertNodeToElement,
  htmlparser2,
} from "react-html-parser";

const CmsData = () => {
  const [cmsData, setCmsData] = useState([]);
  const [data, setData] = useState("");
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState(false);
  const [view, setView] = useState(false);

  const toggle = () => {
    setModal(!modal);
  };

  const handleChangeInput = (event) => {
    if (event == "") {
      setError("Content is required");
      setData("");
    } else {
      setError("");
      setData(event);
    }
  };
  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      "admin/cms/get",
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoading(false);
      toast.error('Something went wrong. Try again later.');
    } else {
      setCmsData(promiseToken.response.ResponseBody);
    }
  };
  useEffect(() => {
    getData();
  }, [status]);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (error == "") {
      let dataSend = {
        content: data,
      };
      if (id != "") {
        dataSend.cms_id = id;
      }
      let api = "";
      if (id != "") {
        api = "admin/cms/update";
      } else {
        api = "admin/cms/create";
      }

      const promise = await requestToken(
        api,
        dataSend,
        "post",
        localStorage.getItem("token")
      );

      if (promise.error) {
        toast.error('Something went wrong. Try again later.');
        setLoading(false);
      } else {
        if (promise.response.succeeded === true) {
          if (status == true) {
            setStatus(false);
          } else {
            setStatus(true);
          }
          toast.success(promise.response.ResponseMessage);
          setModal(false);
        } else {
          toast.error(promise.response.ResponseMessage);
        }
        setLoading(false);
      }
    }
  };

  const containerStyle = {
    zIndex: 1999,
  };

  // const tabItems = [
  //   "All Booking",
  //   "Completed",
  //   "Processing",
  //   "Confirmed",
  //   "Cancelled",
  //   "Paid",
  //   "Unpaid",
  // ];

  return (
    <>
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        style={containerStyle}
      /> */}
      <div className="tabs -underline-2 js-tabs">
        {/* <div className="tabs__controls row x-gap-40 y-gap-10 lg:x-gap-20 js-tabs-controls">
          {tabItems.map((item, index) => (
            <div className="col-auto" key={index}>
              <button
                className={`tabs__button text-18 lg:text-16 text-light-1 fw-500 pb-5 lg:pb-0 js-tabs-button ${
                  activeTab === index ? "is-tab-el-active" : ""
                }`}
                onClick={() => handleTabClick(index)}
              >
                {item}
              </button>
            </div>
          ))}
        </div> */}
        {/* End tabs */}

        <div className="tabs__content pt-30 js-tabs-content">
          <div className="tabs__pane -tab-item-1 is-tab-el-active">
            <div className="overflow-scroll scroll-bar-1">
              <div style={{ float: "right" }}>
              {/* <Tooltip
                      title="Add CMS"
                      position="bottom"
                      arrow={true}
                      distance={15}
                      trigger="mouseenter"
                    >
                <FaRegPlusSquare
                  onClick={() => {
                    setModal(true);
                    setData("");
                    setId("");
                  }}
                  size="20"
                ></FaRegPlusSquare></Tooltip> */}
              </div>
              <table className="table-3 -border-bottom col-12">
                <thead className="bg-light-2">
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Content</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cmsData.length < 1 ? (
                    <tr>
                      <td colSpan={4} style={{textAlign:'center'}}>No content found</td>
                    </tr>
                  ) : (
                    cmsData.map((item, index) => {
                      return (
                        <>
                          <tr key={index + 1}>
                            <td>{index + 1}</td>
                            <td>{item.title}</td>
                            <td>
                              {ReactHtmlParser(item.content.slice(0, 100))}...
                              {/* {item.content.length > 100
                                ? {ReactHtmlParser(item.content.slice(0, 100))}
                                : ReactHtmlParser(item.content)} */}
                            </td>
                            <td>
                            <Tooltip
                                title="Edit CMS"
                                position="bottom"
                                arrow={true}
                                distance={15}
                                trigger="mouseenter"
                              >
                              <FaEdit
                                className="iconcolor"
                                onClick={() => {
                                  setView(false);
                                  setModal(true);
                                  setData(item.content);
                                  setId(item._id);
                                  setTitle(item.title);
                                }}
                                size="25"
                              ></FaEdit></Tooltip>
                              &nbsp;&nbsp;&nbsp;
                              <Tooltip
                                title="View CMS"
                                position="bottom"
                                arrow={true}
                                distance={15}
                                trigger="mouseenter"
                              >
                              <FaEye
                                className="iconcolor"
                                onClick={() => {
                                  setModal(true);
                                  setView(true);
                                  setData(item.content);
                                  setTitle(item.title);
                                }}
                                size="25"
                              ></FaEye></Tooltip>
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
      {/* Model */}
      <Modal isOpen={modal} toggle={toggle} size="lg" backdrop={true}>
        <form>
          {view == true ? (
            <>
              <ModalHeader toggle={toggle}>View {title}</ModalHeader>
              <ModalBody>{ReactHtmlParser(data)}</ModalBody>
            </>
          ) : (
            <>
              <ModalHeader toggle={toggle}>
                {id == "" ? `Add ${title}` : `Edit ${title}`}
              </ModalHeader>
              <ModalBody>
              {title.includes('About')==true?
              <div className="form-input ">
                <textarea name="content" rows={10} cols={10} onChange={(event) => handleChangeInput(event.target.value)}>{data}</textarea>
              </div>:
                <QuillNoSSRWrapper
                  name="content"
                  theme="snow"
                  value={data}
                  onChange={(event) => handleChangeInput(event)}
                  disabled={true}
                />}
                <span className="text-danger">{error}</span>
              </ModalBody>
              <ModalFooter>
                <button
                  type="submit"
                  className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                  disabled={loading}
                  onClick={save}
                >
                  {loading ? (
                    <>
                      <Spinner></Spinner>&nbsp;Loading...
                    </>
                  ) : (
                    <>
                      Save Changes{" "}
                      <div className="icon-arrow-top-right ml-15" />
                    </>
                  )}
                </button>
              </ModalFooter>
            </>
          )}
        </form>
      </Modal>
    </>
  );
};

export default CmsData;
