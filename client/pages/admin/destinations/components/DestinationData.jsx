"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
const QuillNoSSRWrapper = dynamic(import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});

import { useState, useEffect, useRef } from "react";
//import Pagination from "../../common/Pagination";
//import ActionsButton from "./ActionsButton";
import {
  getRequestToken,
  requestTokenUpload,
  requestToken,
} from "../../../../api/Api";

import toast from "react-hot-toast";


import { FaEdit, FaEye, FaRegPlusSquare } from "react-icons/fa";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import { Spinner, Badge } from "reactstrap";
import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";
import { BASE_URL } from "../../../../config";
import { BASE_URL_IMG } from "../../../../config";

import { useFormik } from "formik";
import * as Yup from "yup";
import Details from "./Details";

import ReactHtmlParser, {
  processNodes,
  convertNodeToElement,
  htmlparser2,
} from "react-html-parser";

const DstnData = () => {
  const fileInputRef = useRef();
  const [dstnData, setDstnData] = useState([]);
  const [data, setData] = useState({name:'',nameError:'',title:'',titleError:'',descriptionError:'',description:''});
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState(false);
  const [view, setView] = useState(false);
  const [viewData, setViewData] = useState(false);
  const [images, setImages] = useState([]);
  const [imagesTemp, setImagesTemp] = useState([]);
  const [imagesTempRemove, setImagesTempRemove] = useState([]);
  const [imageError, setImageError] = useState("");
  const [deleteIndex, setDeleteIndex] = useState("");
  const [loader, setLoader] = useState(true);

  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  const minLength = 2;
  const maxLength = 100;
  const singleSpaceRegex = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/;
  const singleSpaceRegexTitle = /^[^\s]+(\s[^\s]+)*$/;

  const initialValues = {
    // name: data?.name,
    // title: data?.title,
    // description: data?.description,
    name: data?.name,
    title: data?.title,
  };
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .matches(/^[a-zA-Z ]+$/, "Only alphabet are allowed")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    title: Yup.string()
      .required("Title is required")
      .min(2, "Title must be at least 2 characters")
      .max(100, "Title must be at most 100 characters"),
  });

  const toggle = () => {
    setData({name:'',nameError:'',title:'',titleError:'',descriptionError:'',description:''});
    // formik.resetForm({
    //   name: '',
    //   title: '',
    // })
    setModal(!modal);
  };

  const handleChangeInput = (event) => {
    if (event == "" || event.trim() == "<p><br></p>") {
      setData({...data,descriptionError:'Discription is required',description:event});
    }else if(!singleSpaceRegexTitle.test(event)){
      setData({...data,descriptionError:'Discription must have only one space between words and should not start or end with spaces',description:event});
    } else {
      setData({...data,descriptionError:'',description:event});
    }
  };
  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      "admin/destination/get",
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoader(false);
      toast.error("Something went wrong. Try again later.");
    } else {
      setLoader(false);
      setDstnData(promiseToken.response.ResponseBody);
    }
  };
  useEffect(() => {
    getData();
  }, [status]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let newValidation = true;
    let error = {name:'',title:'',description:''}

    if(data.name.length < 1){
      newValidation = false;
      error.name='Name Field is Required';
    }else if(data.name.length < minLength){
      newValidation = false;
      error.name='Name must be at least 2 characters';
    }else if(data.name.length < minLength){
      newValidation = false;
      error.name="name can't be longer than 50 characters";
    }
    // else if(!singleSpaceRegex.test(data.name)){
    //   newValidation = false;
    //   error.name='Name must have only alphabets with one space between words and should not start or end with spaces';
    // }
    if(data.title.length < 1){
      newValidation = false;
      error.title='Title Field is Required';
    }else if(data.title.length < minLength){
      newValidation = false;
      error.title='Title must be at least 2 characters';
    }else if(data.name.length < minLength){
      newValidation = false;
      error.title="Title can't be longer than 50 characters";
    }else if(!singleSpaceRegexTitle.test(data.name)){
      newValidation = false;
      error.title='Title must have only one space between words and should not start or end with spaces';
    }
    if (data.description == "" || data.description.trim() == "<p><br></p>") {
      newValidation = false;
      error.description='Discription is required';
    }if(!singleSpaceRegexTitle.test(data.description)){
      newValidation = false;
      error.description='Discription must have only one space between words and should not start or end with spaces';
    }
    
    if (id != "") {
      if (imagesTemp.length === 0 && images.length === 0) {
        newValidation = false;
        setImageError("Atleast one image is required");
        setLoading(false);
      } else {
        setImageError("");
      }
    } else {
      if (images.length === 0) {
        newValidation = false;
        setImageError("Atleast one image is required");
        setLoading(false);
      } else {
        setImageError("");
      }
    }
    setData({...data,nameError:error.name,titleError:error.title,descriptionError:error.description});

    if (newValidation) {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("title", data.title);
      formData.append("description", data.description);
      for (let i = 0; i < images.length; i++) {
        const element = images[i];
        formData.append("images", element);
      }
      if (deleteIndex.length > 0) {
        formData.append("delete_index", deleteIndex);
      }

      let api = "";
      if (id != "") {
        formData.append("destination_id", id);
        api = "admin/destination/update";
      } else {
        api = "admin/destination/add";
      }

      const promise = await requestTokenUpload(
        api,
        formData,
        "post",
        localStorage.getItem("token")
      );

      if (promise.error) {
        setLoading(false);
        if (promise?.error?.response?.data?.ResponseBody[0]?.title) {
          toast.error(
            promise?.error?.response?.data?.ResponseBody[0]?.title.toLowerCase()
          );
        } else {
          toast.error("Something went wrong. Please try again");
        }
      } else {
        if (promise.response.succeeded === true) {
          //resetForm();
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
    }else{
      setLoading(false);
    }
  };

  const titleValidate = () => {
    //console.log(formik.errors);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit,
    validate: titleValidate,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema,
  });

  const containerStyle = {
    zIndex: 1999,
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setImageError("");
      //return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("");
      //return;
    }
    
    setImageError("");
    
    const files = event.target.files;

    const previousImages = [...images];

    const selectedImages = [...previousImages];
    for (let i = 0; i < files.length; i++) {
      if ( (!files[i]) || (!files[i].type.startsWith("image/")) ) {
      }else{
        selectedImages.push(files[i]);
      }
    }

    const filteredImages = selectedImages.filter((image) => image);

    setImages(filteredImages);
  
  };

  const handleImageRemove = (index) => {
    const filteredImages = [...images];
    filteredImages.splice(index, 1);
    setImages(filteredImages);
  };

  const handleImageRemoveTemp = (image, index) => {
    const filteredImages = [...imagesTemp];
    filteredImages.splice(index, 1);
    const index1 = imagesTempRemove.indexOf(image);
    let mid = deleteIndex;
    if (deleteIndex == "") {
      mid = `${index1}`;
    } else {
      mid = `${mid},${index1}`;
    }
    setDeleteIndex(mid);
    setImagesTemp(filteredImages);
  };

  const renderNewImagesPreview = () => {
    return (
      <div className="row">
        {images.map((image, index) => {
          return (
            <div key={index} className="col-sm-2">
              <div className="image-preview" style={{ paddingBottom: "10px" }}>
                <div
                  className="image-remove"
                  onClick={() => handleImageRemove(index)}
                  style={{ display: "flex", justifyContent: "end" }}
                >
                  <span className="text-danger" style={{ cursor: "pointer" }}>
                    &times;
                  </span>
                </div>

                {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    width={"150px"}
                    height={"150px"}
                    onError={(e) =>
                      console.error(
                        `Error loading image at index ${index}: ${e}`
                      )
                    }
                  />
                )}
                {!image && <div>No image available at index {index}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderNewImagesPreviewEdit = () => {
    return (
      <div className="row">
        {imagesTemp.map((image, index) => {
          return (
            <div key={index} className="col-sm-2">
              <div className="image-preview" style={{ paddingBottom: "10px" }}>
                <div
                  className="image-remove"
                  onClick={() => handleImageRemoveTemp(image, index)}
                  style={{ display: "flex", justifyContent: "end" }}
                >
                  <span className="text-danger" style={{ cursor: "pointer" }}>
                    &times;
                  </span>
                </div>

                {image && (
                  <img
                    src={`${BASE_URL_IMG}${image}`}
                    alt={`Preview ${index}`}
                    width={"150px"}
                    height={"150px"}
                    onError={(e) =>
                      console.error(
                        `Error loading image at index ${index}: ${e}`
                      )
                    }
                  />
                )}
                {!image && <div>No image available at index {index}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const onEdit = (item) => {console.log(item);
    setView(false);
    setDeleteIndex("");
    setImages([]);
    setImageError("");
    setError("");
    setModal(true);
    //setDescription(item.description);
    setData({...data,name:item.name,title:item.title,description:item.description});
    //setData(item);
    setImagesTemp(item.images);
    setImagesTempRemove(item.images);
    setId(item._id);
  };

  const changeStatus = async (id, status1) => {
    const data = {
      destination_id: id,
      status: status1 == 1 ? 2 : 1,
    };
    const promise = await requestToken(
      "admin/destination/change-status",
      data,
      "post",
      localStorage.getItem("token")
    );

    if (promise.error) {
      toast.error("Something went wrong. Please try again");
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
  };
  const changeName = (e) => {
    if(e.target.value.length < 1){
      setData({...data,nameError:'Name Field is Required',name:e.target.value});
    }else if(e.target.value.length < minLength){
      setData({...data,nameError:'Name must be at least 2 characters',name:e.target.value});
    }else if(e.target.value.length > maxLength){
      setData({...data,nameError:"name can't be longer than 100 characters",name:e.target.value});
    }
    // else if(!singleSpaceRegex.test(e.target.value)){
    //   setData({...data,nameError:'Name must have only alphabets with one space between words and should not start or end with spaces',name:e.target.value});
    // }
    else{
      setData({...data,nameError:'',name:e.target.value});
    }
  }
  const changeTitle = (e) => {
    if(e.target.value.length < 1){
      setData({...data,titleError:'Title Field is Required',title:e.target.value});
    }else if(e.target.value.length < minLength){
      setData({...data,titleError:'Title must be at least 2 characters',title:e.target.value});
    }else if(e.target.value.length > maxLength){
      setData({...data,titleError:"Title can't be longer than 50 characters",title:e.target.value});
    }else if(!singleSpaceRegexTitle.test(e.target.value)){
      setData({...data,titleError:'Title must have only one space between words and should not start or end with spaces',title:e.target.value});
    }else{
      setData({...data,titleError:'',title:e.target.value});
    }
  }
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
              <div
                style={{
                  float: "right",
                  paddingRight: "60px",
                  paddingBottom: "20px",
                }}
              >
                <div class="row">
                  <div class="col-sm">
                    <Tooltip
                      title="Add Destination"
                      position="bottom"
                      arrow={true}
                      distance={15}
                      trigger="mouseenter"
                    >
                      <FaRegPlusSquare
                        className="iconcoloradd"
                        onClick={() => {
                          setView(false);
                          setDeleteIndex("");
                          setImages([]);
                          setImageError("");
                          setError("");
                          setData({name:'',nameError:'',title:'',titleError:'',descriptionError:'',description:''});
                          setModal(true);
                          //setDescription("");
                          setImagesTemp([]);
                          setImagesTempRemove([]);
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
                    <th>#</th>
                    <th>Name</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loader === true ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center" }}>
                        <Spinner color="primary"></Spinner>
                      </td>
                    </tr>
                  ) : dstnData.length < 1 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center" }}>
                        No destination found
                      </td>
                    </tr>
                  ) : (
                    dstnData.map((item, index) => {
                      return (
                        <>
                          <tr key={index + 1}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>
                              <img
                                src={`${BASE_URL_IMG}${item.images[0]}`}
                                height="50"
                                width="100"
                                className="rounded"
                              />
                            </td>
                            <td>{item.title}</td>
                            <td>
                            {ReactHtmlParser(item.description.slice(0, 100) + ' ...')}
                            </td>
                            <td>
                              <div class="form-check form-switch d-flex justify-content-center">
                              {item.status === 1 ? 
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked={item.status === 1}
                                  onClick={() => {
                                    changeStatus(item._id, item.status);
                                  }}
                                  style={{ cursor: "pointer",backgroundColor:'#3C6EFD' }}
                                />:
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  defaultChecked={item.status === 1}
                                  onClick={() => {
                                    changeStatus(item._id, item.status);
                                  }}
                                  style={{ cursor: "pointer",backgroundColor:'#FFCCCB' }}
                                />
                              }
                              </div>
                              <div className="d-flex justify-content-center">
                              {item.status == 1 ? (
                                <Badge color="primary">Enabled</Badge>
                              ) : (
                                <Badge color="danger">Disabled</Badge>
                              )}
                              </div>
                            </td>
                            {/* <td>
                              <Tooltip
                                title="Change Status"
                                position="bottom"
                                arrow={true}
                                distance={15}
                                trigger="mouseenter"
                              >
                              <button onClick={()=>{changeStatus(item._id, item.status)}} style={{color:'#5e92fd',cursor:'pointer'}}>
                                {item.status == 1 ? "Active" : "Inactive"}
                              </button>
                              </Tooltip>
                            </td> */}
                            <td>
                              <Tooltip
                                title="Edit Destination"
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
                              &nbsp;&nbsp;&nbsp;
                              <Tooltip
                                title="View Destination"
                                position="bottom"
                                arrow={true}
                                distance={25}
                                trigger="mouseenter"
                              >
                                <FaEye
                                  className="iconcolor"
                                  onClick={() => {
                                    setModal(true);
                                    setView(true);
                                    setViewData(item);
                                  }}
                                  size="20"
                                ></FaEye>
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
      {/* Model */}
      <Modal isOpen={modal} toggle={toggle} size="xl" backdrop={true}>
        <form>
          {view == true ? (
            <>
              <ModalHeader toggle={toggle}>View Destination</ModalHeader>
              <ModalBody>
                <Details viewData={viewData} />
              </ModalBody>
              <ModalFooter></ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader toggle={toggle}>
                {id == "" ? "Add Destination" : "Edit Destination"}
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
                        value={data.name}
                        onChange={changeName}
                        disabled={id != ""}
                        maxLength={100}
                      />
                      <label className="lh-1 text-14 text-light-1">Name</label>
                    </div>
                    <span className="text-danger">{data.nameError}</span>
                  </div>
                  {/* End .col */}

                  <div className="col-12">
                    <div className="form-input ">
                      <input
                        type="text"
                        name="title"
                        value={data.title}
                        onChange={changeTitle}
                        maxLength={100}
                      />
                      <label className="lh-1 text-14 text-light-1">Title</label>
                    </div>
                    <span className="text-danger">{data.titleError}</span>
                  </div>
                  <div className="col-12">
                    <QuillNoSSRWrapper
                      name="description"
                      theme="snow"
                      defaultValue={data.description}
                      // value={data}
                      onChange={(event) => handleChangeInput(event)}
                      disabled={true}
                      style={{ height: "180px" }}
                    />
                    <br />
                    <br />

                    <span className="text-danger">{data.descriptionError}</span>
                  </div>

                  <div className="col-12">
                    {/* <input
                      type="file"
                      onChange={handleFileInputChange}
                      accept="image/png, image/gif, image/jpeg"
                      ref={fileInputRef}
                      hidden
                    />
                    <button
                      color="secondary" 
                      onClick={() => {
                        fileInputRef.current.click();
                      }}
                    >
                    Upload Slide Image
                    </button>
                    <div>{images.length > 0 && renderNewImagesPreview()}</div>
                    <span className="text-danger">{error}</span> */}
                    <div className="form-group">
                      <input
                        type="file"
                        name="images"
                        multiple
                        onChange={handleFileInputChange}
                        accept="image/png, image/gif, image/jpeg"
                      />
                      <div className="small text-muted">
                        <span>
                          (Note: Only JPEG, JPG, PNG, GIF image type allowed)
                        </span>
                      </div>
                    </div>
                    {imageError !== "" ? (
                      <div className="text-danger">
                        <em>{imageError}</em>
                      </div>
                    ) : null}

                    {imagesTemp.length > 0 && renderNewImagesPreviewEdit()}
                    {images.length > 0 && renderNewImagesPreview()}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <button
                  type="submit"
                  className="button py-20 -dark-1 bg-blue-1 text-white w-100"
                  disabled={loading}
                  onClick={onSubmit}
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
              </ModalFooter>
            </>
          )}
        </form>
      </Modal>
    </>
  );
};

export default DstnData;
