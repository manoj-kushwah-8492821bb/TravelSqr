"use client";

import { useState, useEffect, useMemo } from "react";
import { getRequestToken, requestToken, requestTokenUpload } from "../../../../api/Api";

import toast from "react-hot-toast";

import { FaXmark } from "react-icons/fa6";

import { FaEdit, FaEye, FaRegPlusSquare } from "react-icons/fa";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import { Spinner } from "reactstrap";

import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";
import { BASE_URL_IMG } from "../../../../config";

const Blogs = () => {

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
  
  const [image, setImage] = useState(null);  // Stores selected image
  const [imagePreview, setImagePreview] = useState("");  // Stores image preview URL

  const [error, setError] = useState("");

  const [editId, setEditId] = useState(null);
  const [tipInput, setTipInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const [addData, setAddData] = useState({
    title: "",
    introduction: "",
    tips: [],       // ✅ Initialize as an array
    conclusion: "",
    date: "",
    keywords: [],   // ✅ Initialize as an array
    image: null,
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
 

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setAddData((prev) => {
      if (name === "keywords" || name === "tips") {
        return { ...prev, [name]: value.split(",").map((item) => item.trim()) };
      }
      return { ...prev, [name]: value };
    });
  };
  


  // Validate the form before submission
  const validateForm = () => {
    let errors = {};
    if (!addData.title) errors.title = "Title is required";
    if (!addData.content) errors.content = "Content is required";
    if (!addData.author) errors.author = "Author is required";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/blog?page=${page}&limit=${pageLength}&search=${search}`,
      {},
      "get",
      localStorage.getItem("token")
    );

    console.log("getBlogData_:", promiseToken)
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
  
    if (!file) {
      setError("Please select an image.");
      return;
    }
  
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
  
    setAddData({ ...addData, image: file });
    setError("");
  };
  


const addTip = () => {
  if (tipInput.trim() !== "") {
    setAddData((prev) => ({
      ...prev,
      tips: [...prev.tips, tipInput], // ✅ Adds new tip to the array
    }));
    setTipInput(""); // Clear input field after adding
  }
};

const addKeyword = () => {
  if (keywordInput.trim() !== "") {
    setAddData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, keywordInput], // ✅ Adds new tip to the array
    }));
    setKeywordInput(""); // Clear input field after adding
  }
};

const removeKeyword = (index) => {
  setAddData((prevData) => ({
    ...prevData,
    keywords: prevData.keywords.filter((_, i) => i !== index)
  }));
};

const removeTip = (index) => {
  setAddData((prevData) => ({
    ...prevData,
    tips: prevData.tips.filter((_, i) => i !== index)
  }));
};


  // Handle Form Submission (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
    formData.append("title", addData.title);
    formData.append("introduction", addData.introduction);
    formData.append("tips", addData.tips.join(", ")); // ✅ Convert array to string
    formData.append("conclusion", addData.conclusion);
    formData.append("keywords", addData.keywords.join(", ")); // ✅ Convert array to string
    formData.append("date", addData.date);
  
    if (addData.image) {
      formData.append("image", addData.image);
    }
  
    if (editId) {
      formData.append("blog_id", editId);
    }
  
    try {
      const apiEndpoint = editId ? `admin/blog/update` : `admin/blog/add`;
      const token = localStorage.getItem("token");
  
      const result = await requestTokenUpload(apiEndpoint, formData, "post", token);
  
      if (result.response?.succeeded) {
        toast.success(result.response.ResponseMessage);
        getData(); // Refresh list
        resetForm();
      } else {
        toast.error(result.response?.ResponseMessage || "Failed to save blog.");
      }
    } catch (error) {
      toast.error("Error saving blog.");
    }
  
    setLoading(false);
  };
  
  

  const onEdit = (item) => {
    setEditId(item._id);
    setAddData({
        title: item.title,
        introduction: item.introduction,
        conclusion: item.conclusion,
        tips: item.tips,
        keywords: item.keywords,
        image: item.image,  // Add image field
        date: item.date,
    });
    setModal(true);
  };
  

  const onDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
  
    const newData = { blog_id: blogId };
  
    try {
      const promise = await requestToken(
        "admin/blog/delete",
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
      console.error("Delete blog Error:", error);
      toast.error("Error deleting blog. Please try again.");
    }
  };
  

    // Reset Form
    const resetForm = () => {
      setAddData({
        title: "",
        introduction: "",
        tips: [],
        conclusion: "",
        date: "",
        keywords: [],
        image: "",
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
                        placeholder="Search by blog"
                        size="35"
                        style={{ width: "auto" }}
                        onChange={searchValue}
                        value={searchData}
                      />
                    </div>
                  </div>
                  <div className="col-sm">
                    <Tooltip
                      title="Add Blog"
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
                            title: "",
                            content: "",
                            author: "",
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
                    <th>Title</th>
                    <th>Introduction</th>
                    <th>Conclusion</th>
                    <th>Tips</th>
                    <th>Keywords</th>
                    <th>Date</th>
                    <th>Image</th>
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
                        No blog found
                      </td>
                    </tr>
                  ) : (
                    couponData.map((item, index) => {
                      return (
                        <tr key={index + 1}>
                          <td>{item.title}</td>
                          <td>
                            {item.introduction}
                          </td>
                          <td>{item.conclusion}</td>

                          {/* Tips */}
                          <td>{item.tips ?.map((tip, i) =>  (
                            <span key={i}>
                              {i+1}.{tip}
                              <br/>
                              <br />
                            </span>
                           ))}
                          </td>

                          {/* Keyword */}
                          <td>{item.keywords ?.map((keyword, i) => (
                            <span key={i}>
                              {i+1}. {keyword} 
                              <br />
                              <br />
                            </span>
                          ))}

                          </td>
                          <td>{item.date}</td>
                       
                          <td>
                            <img
                              width={100}
                              height={150}
                              className="rounded-4 col-12"
                              src={`${BASE_URL_IMG}server/uploads/admin/${item.image}`}
                              alt={item?.name || "Destination"}
                              priority
                            />
                          </td>
                          <td>
                            <Tooltip
                              title="Edit Blog"
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
                              title="Delete Blog"
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
        {id === "" ? "Add Blog" : "Edit Blog"}
      </ModalHeader>

      <ModalBody>
        <div className="row y-gap-20">
          {/* Title */}
          <div className="col-12">
            <div className="form-input">
              <input
                type="text"
                name="title"
                value={addData.title}
                onChange={handleChange}
                maxLength={200}
              />
              <label className="lh-1 text-14 text-light-1">Title</label>
            </div>
            <span className="text-danger">{errors.title}</span>
          </div>

          {/* Introduction */}
          <div className="col-12">
            <div className="form-input">
              <input
                type="text"
                name="introduction"
                value={addData.introduction}
                onChange={handleChange}
              />
              <label className="lh-1 text-14 text-light-1">Introduction</label>
            </div>
            <span className="text-danger">{errors.introduction}</span>
          </div>

          {/* Date */}
          <div className="col-12">
            <div className="form-input">
              <input
                type="date"
                name="date"
                value={addData.date}
                onChange={handleChange}
              />
              <label className="lh-1 text-14 text-light-1">Date</label>
            </div>
            <span className="text-danger">{errors.date}</span>
          </div>

{/* Keywords Input */}
<div className="col-12">
  <div className="form-input">
    <input
      type="text"
      name="keywords"
      value={keywordInput} // ✅ Convert array to string for display
      onChange={(e) => setKeywordInput(e.target.value)}
      placeholder="Enter keywords"
    />
    <button type="button" onClick={addKeyword}>Add</button> {/* ✅ Button to add tips */}
  </div>

    {/* Display Keyword as a list */}
    {Array.isArray(addData?.keywords) ? (
      addData.keywords.map((keyword, index) => (
      <li key={index}>
        {keyword}
        <button type="button" onClick={() => removeKeyword(index)}>❌</button>
      </li>
    ))
    ) : (
      <li>No keywords available</li>
    )}


  <span className="text-danger">{errors.keywords}</span>
</div>


{/* Tips Input */}
<div className="col-12">
  <div className="form-input">
    <input
      type="text"
      value={tipInput}
      onChange={(e) => setTipInput(e.target.value)}
      placeholder="Enter a tip and click 'Add'"
    />
    <button type="button" onClick={addTip}>Add</button> {/* ✅ Button to add tips */}
  </div>

  {/* Display tips as a list */}

  {Array.isArray(addData?.tips) ? (
    addData.tips.map((tip, index) => (
      <li key={index}>
        {tip}
        <button type="button" onClick={() => removeTip(index)}>❌</button>
      </li>
    ))
  ) : (
    <li>No tips available</li>
  )}

  {/* <ul>
    {addData.tips.map((tip, index) => (
      <li key={index}>{tip}</li>
    )) || []}
  </ul> */}

  <span className="text-danger">{errors.tips}</span>
</div>


          {/* Conclusion */}
          <div className="col-12">
            <div className="form-input">
              <textarea
                name="conclusion"
                value={addData.conclusion}
                onChange={handleChange}
                rows="3"
              />
              <label className="lh-1 text-14 text-light-1">Conclusion</label>
            </div>
            <span className="text-danger">{errors.conclusion}</span>
          </div>

          {/* Image Upload */}
          <div className="col-12">
            <div className="form-input">
              <input
                name="profile"
                type="file"
                id="avatar-upload"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageChange}
              />
              <label className="lh-1 text-14 text-light-1">Image</label>
            </div>
            <span className="text-danger">{error}</span>
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
                {id === "" ? "Add Blog" : "Save Changes"} <div className="icon-arrow-top-right ml-15" />
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

export default Blogs;
