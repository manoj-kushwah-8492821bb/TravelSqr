"use client";

import { useState, useEffect } from "react";
import { getRequestToken, requestToken } from "../../../../api/Api";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
const QuillNoSSRWrapper = dynamic(import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});
import { toast } from "react-hot-toast";


import { Row, Col, Spinner, Badge } from "reactstrap";
import "react-tippy/dist/tippy.css";
import { useFormik } from "formik";
import * as Yup from "yup";

const Email = () => {
  const [userData, setUserData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const initialValues = {
    subject: data?.subject,
    content: data?.content,
  };
  const validationSchema = Yup.object({
    subject: Yup.string()
      .required("Subject is required")
      .matches(
        /^(?!\s)(?!.*\s{2,})(?!.*\s$)[\w\W]*$/,
        "Subject can contain alphanumeric characters and special characters, but no multiple spaces, and should not start or end with a space"
      )
      .min(2, "Subject must be at least 2 characters")
      .max(100, "Subject must be at most 100 characters"),
    content: Yup
      .string()
      .test('no-multi-spaces', "Subject can contain alphanumeric characters and special characters, but no multiple spaces, and should not start or end with a space", (value) => {
        return value && /^[^\s]+(\s[^\s]+)*$/.test(value);
      })
      .min(10, "Subject must be at least 10 characters"),
  });

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/alluser?search=${search}&email=${searchEmail}`,
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      setLoader(false);
      toast.error("Something went wrong. Try again later.");
    } else {
      setLoader(false);
      setUserData(promiseToken.response.ResponseBody);
    }
  };
  useEffect(() => {
    getData();
  }, [search, searchEmail]);

  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    if(selectedUserIds.length<1){
      setLoading(false);
      toast.error("Please check at least one user.");
    }else{
      const data = {
        subject: values.subject,
        content: values.content,
        users: selectedUserIds
      };
      const promise = await requestToken(
        'admin/bulk-email',
        data,
        "post",
        localStorage.getItem("token")
      );
  
      if (promise.error) {
        toast.error("Something went wrong. Try again later.");
        setLoading(false);
      } else {
        if (promise.response.succeeded === true) {
          toast.success(promise.response.ResponseMessage);
          setSelectedUserIds([]);
          resetForm();
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

  const containerStyle = {
    zIndex: 1999,
  };

  const searchValue = (e) => {
    if (e.target.value.length > 2 || e.target.value.length == 0) {
      setSearch(e.target.value);
    }
  };
  const searchValueEmail = (e) => {
    if (e.target.value.length > 2 || e.target.value.length == 0) {
      setSearchEmail(e.target.value);
    }
  };

  const handleCheckboxChange = (e, userId) => {
    if (e.target.checked) {
      setSelectedUserIds((prev) => [...prev, userId]);
    } else {
      setSelectedUserIds((prev) => prev.filter((email) => email !== userId));
    }
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      const allUserIds = userData.map((user) => user.email);
      setSelectedUserIds(allUserIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  return (
    <>
      <div className="tabs -underline-2 js-tabs">
        <div className="tabs__content pt-30 js-tabs-content">
          <div className="tabs__pane -tab-item-1 is-tab-el-active">
            <div className="row">
              <div className="col-sm-7">
                <Row>
                  <Col sm="6">
                    <div className="single-field relative d-flex items-center py-10">
                      <input
                        className="pl-10 border-light text-dark-1 h-50 rounded-8"
                        type="text"
                        placeholder="Search by name"
                        size="36"
                        style={{ width: "auto" }}
                        onChange={searchValue}
                      />
                    </div>
                  </Col>
                  <Col sm="6">
                    <div className="single-field relative d-flex items-center py-10">
                      <input
                        className="pl-10 border-light text-dark-1 h-50 rounded-8"
                        type="text"
                        placeholder="Search by email"
                        size="36"
                        style={{ width: "auto" }}
                        onChange={searchValueEmail}
                      />
                    </div>
                  </Col>
                </Row>
                <div style={{ maxHeight: "800px", overflow: "auto" }}>
                  <table className="table">
                    <thead className="bg-light-2">
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            onChange={handleSelectAllChange}
                            checked={selectedUserIds.length === userData.length}
                            title="Check All"
                          />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loader ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            <Spinner color="primary"></Spinner>
                          </td>
                        </tr>
                      ) : userData.length < 1 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            No user found
                          </td>
                        </tr>
                      ) : (
                        userData.map((item, index) => (
                          <tr key={index + 1}>
                            <td>
                              <input
                                type="checkbox"
                                onChange={(e) =>
                                  handleCheckboxChange(e, item.email)
                                }
                                checked={selectedUserIds.includes(item.email)}
                                title="Check this"
                              />
                            </td>
                            <td>
                              {item.first_name} {item.last_name}
                            </td>
                            <td>{item.email}</td>
                            <td>
                              {item.status === 1 ? (
                                <Badge color="primary">Active</Badge>
                              ) : (
                                <Badge color="danger">Inactive</Badge>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-sm-5">
                <form className="col-xl-12" onSubmit={formik.handleSubmit}>
                  <div className="row x-gap-20 y-gap-20">
                    <div className="col-12">
                      <h1 className="text-20 lh-14 fw-600">Enter Content</h1>
                    </div>
                    <div className="col-12">
                      <div className="form-input ">
                        <input
                          type="text"
                          name="subject"
                          value={formik.values.subject}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <label className="lh-1 text-16 text-light-1">
                          Subject
                        </label>
                      </div>
                      {formik.touched.subject && formik.errors.subject && (
                        <span className="text-danger">
                          {formik.errors.subject}
                        </span>
                      )}
                    </div>
                    <div className="col-12">
                      <QuillNoSSRWrapper
                        name="content"
                        theme="snow"
                        value={formik.values.content}
                        onChange={(content, delta, source, editor) => {
                          formik.setFieldValue("content", content);
                        }}
                        // modules={{
                        //   toolbar: false,
                        // }}
                        readOnly={false} // Ensure this is false for editing
                      />
                      {formik.touched.content && formik.errors.content && (
                        <span className="text-danger">
                          {formik.errors.content}
                        </span>
                      )}
                    </div>
                    <div className="d-flex justify-content-center align-items-center pt-30">
                      <button
                        type="submit"
                        className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner></Spinner>&nbsp;Loading...
                          </>
                        ) : (
                          <>
                            Send Email{" "}
                            <div className="icon-arrow-top-right ml-15" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Email;
