"use client";

import { useState, useEffect, useMemo } from "react";
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

import Select from "react-select";
import { Country, State, City } from "country-state-city";

const Airports = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [countryError, setCountryError] = useState('');
  const [cityError, setCityError] = useState('');
  // const [error, setError] = useState({
  //   errorCountry: "",
  //   errorState: "",
  //   errorCity: "",
  //   status: false,
  // });

  const [airportData, setAirportData] = useState([]);
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

  const [addData, setAddData] = useState({name:'',code:'',nameError:'',codeError:''});
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  const minLength = 2;
  const singleSpaceRegex = /^[^\s]+(\s[^\s]+)*$/;
  const toggle = () => {
    setData(null);
    setModal(!modal);
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/airports?page=${page}&limit=${pageLength}&search=${search}`,
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoader(false);
      toast.error('Something went wrong. Try again later.');
    } else {
      setLoader(false);
      setAirportData(promiseToken.response.ResponseBody.docs);
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

  const initialValues = {
    name: data?.name,
    code: data?.code,
  };
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name Field is Required")
      .matches(
        /^[a-zA-Z]+(\s[a-zA-Z]+)*$/,
        "Only alphabets are allowed with single space between words"
      )
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 25 characters"),
    code: Yup.string()
      .required("Code is required")
      .matches(/^[a-zA-Z]+$/, "Only alphabet are allowed")
      .min(2, "Code must be at least 2 characters")
      .max(25, "Code must be at most 25 characters"),
  });

  const onSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    let status = 1;

    let error = {name:'',code:''}


    if(addData.name.length < 1){
      status = 0;
      error.name='Name Field is Required';
    }else if(addData.name.length < minLength){
      status = 0;
      error.name='Name must be at least 2 characters';
    }else if(!singleSpaceRegex.test(addData.name)){
      status = 0;
      error.name='Name must have only one space between words and should not start or end with spaces';
    }
    if(addData.code.length < 1){
      status = 0;
      error.code = 'Code Field is Required';
    }else if(addData.code.length < minLength){
      status = 0;
      error.code = 'Code must be at least 2 characters';
    }else if(!singleSpaceRegex.test(addData.code)){
      status = 0;
      error.code = 'Code must have only alphabets and numbers';
    }
    setAddData({...addData,codeError:error.code,nameError:error.name});
    if(selectedCountry?.name=='' || selectedCountry?.name==undefined){
      setCountryError('Country Field is Required');
      status = 0;
    }
    if(selectedCity?.name=='' || selectedCity?.name==undefined){
      setCityError('City Field is Required');
      status = 0;
    }
    if(status == 0){
      setLoading(false);
    }else{
      setCountryError('');
      setCityError('');
      let data = {
        name: addData.name,
        code: addData.code,
        country : selectedCountry?.name,
        city : selectedCity?.name
      };
      // if(selectedState?.name!=undefined){
      //   data.country = selectedState?.name;
      // }
      // if(selectedState?.name!=undefined){
      //   data.country = selectedCity?.name;
      // }
      let api = "";
      if (id != "") {
        data.airport_id = id;
        api = "admin/airports/update";
      } else {
        api = "admin/airports/add";
        setSearch('');
      }
      const promise = await requestToken(
        api,
        data,
        "post",
        localStorage.getItem("token")
      );

      if (promise.error) {
        toast.error("Something went wrong. Try again later.");
        setLoading(false);
      } else {
        if (promise.response.succeeded === true) {
          if (id == "") {
            setSearchData('');
            setSearch('');
            if (status == true) {
              setStatus(false);
            } else {
              setStatus(true);
            }
          }else{
            const promiseToken = await getRequestToken(
              `admin/airports?page=${page}&limit=${pageLength}&search=${search}`,
              {},
              "get",
              localStorage.getItem("token")
            );
            if (promiseToken.error) {
              setLoader(false);
              toast.error('Something went wrong. Try again later.');
            } else {
              setLoader(false);
              setAirportData(promiseToken.response.ResponseBody.docs);
              setTotalPages(promiseToken.response.ResponseBody.totalPages);
            }
          }
          
          toast.success(promise.response.ResponseMessage);
          setModal(false);
          setLoading(false);
        } else {
          toast.error(promise.response.ResponseMessage);
          setLoading(false);
        }
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
    setSelectedCountry({ ...selectedCountry, name: item.country });
    setSelectedCity({ ...selectedCity, name: item.city });
    setCountryError('');
    setCityError('');
    setAddData({...addData,name:item.name,code:item.code,nameError:'',codeError:''});
  };
  const onDelete = (data) => {
   
    swal({
      title: `Are you sure you want to delete ${data?.name}?`,
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
        const newData = { airport_id: data._id };
        dataDelete(newData);
      }
    });
  };
  const dataDelete = async (newData) => {
    const promise = await requestToken(
      "admin/airports/delete",
      newData,
      "post",
      localStorage.getItem("token")
    );

    if (promise.error) {
      toast.error("Something went wrong. Try again later.");
    } else {
      if (promise.response.succeeded === true) {
        setSearchData('');
        setSearch('');
        toast.success(promise.response.ResponseMessage);
        setSearch('');
        //window.location.reload(false);
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
  const searchValue = (e) =>{
    if(e.target.value.length>2 || e.target.value.length==0){
      setSearch(e.target.value);
    }
    setSearchData(e.target.value);
    setPage(1);
  }
  const chageName = (e) => {
    if(e.target.value.length < 1){
      setAddData({...addData,nameError:'Name Field is Required',name:e.target.value});
    }else if(e.target.value.length < minLength){
      setAddData({...addData,nameError:'Name must be at least 2 characters',name:e.target.value});
    }else if(!singleSpaceRegex.test(e.target.value)){
      setAddData({...addData,nameError:'Name must have only one space between words and should not start or end with spaces',name:e.target.value});
    }else{
      setAddData({...addData,nameError:'',name:e.target.value});
    }
  }
  const changeCode = (e) => {
    if(e.target.value.length < 1){
      setAddData({...addData,codeError:'Code Field is Required',code:e.target.value});
    }else if(e.target.value.length < minLength){
      setAddData({...addData,codeError:'Code must be at least 2 characters',code:e.target.value});
    }else if(!singleSpaceRegex.test(e.target.value)){
      setAddData({...addData,codeError:'Code must have only alphabets and numbers',code:e.target.value});
    }else{
      setAddData({...addData,codeError:'',code:e.target.value});
    }
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
                        placeholder="Search by airport name"
                        size="35"
                        style={{ width: "auto" }}
                        onChange={searchValue}
                        value={searchData}
                      />
                    </div>
                  </div>
                  <div class="col-sm">
                    <Tooltip
                      title="Add Airport"
                      position="bottom"
                      arrow={true}
                      distance={15}
                      trigger="mouseenter"
                    >
                      <FaRegPlusSquare
                      className="iconcoloradd"
                        onClick={() => {
                          setModal(true);
                          setAddData({...addData,name:'',code:'',nameError:'',codeError:''});
                          setData(null);
                          setId("");
                          setSelectedCountry({ ...selectedCountry, name: '' });
                          setSelectedCity({ ...selectedCity, name: '' });
                          setCountryError('');
                          setCityError('');
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
                    <th>Address</th>
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
                  ) : airportData.length < 1 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        No content found
                      </td>
                    </tr>
                  ) : (
                    airportData.map((item, index) => {
                      return (
                        <>
                          <tr key={index + 1}>
                            <td>{item.name}</td>
                            <td>{item.city}, {item.country}</td>
                            <td>{item.code}</td>
                            <td>
                              <Tooltip
                                title="Edit Airport"
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
                                title="Delete Airport"
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
        <form>
          <ModalHeader toggle={toggle}>
            {id == "" ? "Add Airport" : "Edit Airport"}
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
                    defaultValue={addData.name}
                    onChange={chageName}
                    maxLength={100}
                  />
                  <label className="lh-1 text-14 text-light-1">Name</label>
                </div>
                  <span className="text-danger">{addData.nameError}</span>
              </div>
              {/* End .col */}

              <div className="col-12">
                {/* <div className="form-input "> */}
                  {/* <Select options={options} defaultValue={country} onChange={changeHandler} className="selectFull"/> */}
                  <label className="lh-1 text-16 text-light-1">Select Country</label>
                  <Select
                    options={Country.getAllCountries()}
                    getOptionLabel={(options) => {
                      return options["name"];
                    }}
                    getOptionValue={(options) => {
                      return options["name"];
                    }}
                    defaultValue={selectedCountry?.name}
                    value={selectedCountry}
                    onChange={(item) => {
                      setCountryError(''),
                      setSelectedCountry(item);
                    }}
                    className="selectFull"
                  />
                {/* </div> */}
                <span className="text-danger">{countryError}</span>
              </div>
              {/* <div className="col-12">
                <label className="lh-1 text-16 text-light-1">Select State</label>
                  <Select
                    options={State?.getStatesOfCountry(
                      selectedCountry?.isoCode
                    )}
                    getOptionLabel={(options) => {
                      return options["name"];
                    }}
                    getOptionValue={(options) => {
                      return options["name"];
                    }}
                    value={selectedState}
                    onChange={(item) => {
                      setSelectedState(item);
                    }}
                    className="selectFull"
                  />
                <span className="text-danger">{error.errorState}</span>
              </div> */}
              <div className="col-12">
                {/* <div className="form-input "> */}
                <label className="lh-1 text-16 text-light-1">Select City</label>
                  <Select
                    options={City?.getCitiesOfCountry(
                      selectedCountry?.isoCode
                    )}
                    getOptionLabel={(options) => {
                      return options["name"];
                    }}
                    getOptionValue={(options) => {
                      return options["name"];
                    }}
                    value={selectedCity}
                    onChange={(item) => {
                      setCityError(''),
                      setSelectedCity(item);
                    }}
                    className="selectFull"
                  />
                {/* </div> */}
                <span className="text-danger">{cityError}</span>
              </div>
              {/* End .col */}

              <div className="col-12">
                <div className="form-input ">
                  <input
                    type="text"
                    name="code"
                    defaultValue={addData.code}
                    onChange={changeCode}
                    disabled={id != ""}
                    maxLength={10}
                  />
                  <label className="lh-1 text-14 text-light-1">Code</label>
                </div>
                <span className="text-danger">{addData.codeError}</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="col-12">
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
                  {id == ""?'Add Airport':'Save Changes'} <div className="icon-arrow-top-right ml-15" />
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

export default Airports;
