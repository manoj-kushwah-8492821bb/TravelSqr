import dynamic from "next/dynamic";
import Seo from "../components/common/Seo";
import DefaultHeader from "../components/header/header";
import DefaultFooter from "../components/footer/footer";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import toast from "react-hot-toast";

import { Spinner } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FaRegAddressBook,
  FaMobileScreen,
  FaRegEnvelope,
} from "react-icons/fa6";

const Contact = () => {
  const [contactData, setContactData] = useState({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [loading, setLoading] = useState(false);
  const initialValues = {
    name: "",
    email: "",
    subject: "",
    message: "",
  };
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name Field is required")
      .matches(
        /^[a-zA-Z]+(?: [a-zA-Z]+)*$/,
        "Only alphabets with single spaces allowed"
      )
      .min(2, "Name must be at least 2 characters")
      .max(25, "Name must be at most 25 characters"),
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Entered email is invalid"
      )
      .required("Email is required"),
    subject: Yup.string()
      .required("Subject Field is Required")
      .matches(
        /^[^\s]+(\s[^\s]+)*$/,
        "Multiple consecutive spaces are not allowed"
      )
      .min(2, "Subject must be at least 2 characters")
      .max(35, "Subject must be at most 35 characters"),
    message: Yup.string()
      .required("Message Field is Required")
      .min(32, "Message must be at least 32 characters"),
    // confirmPassword: Yup.string().oneOf(
    //   [Yup.ref("password"), null],
    //   "Passwords must match"
    // ),
  });

  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const data = {
      name: values.name,
      email: values.email,
      subject: values.subject,
      message: values.message,
    };
    const promise = await axios.post(BASE_URL + "flight/message/add", data, {
      headers: { "Content-Type": "application/json" },
    });

    //console.log(promise.data);
    if (promise.data.succeeded === true) {
      toast.success(promise.data.ResponseMessage);
      setLoading(false);
      resetForm();
    } else {
      toast.error(promise.data.ResponseMessage);
      setLoading(false);
    }
    //setIsLoading(false);
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema,
  });
  const getContactDetails = async () => {
    try {
      const contact = await axios.get(
        BASE_URL + "flight/contact",
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (contact?.data?.succeeded === true) {
        setContactData(contact?.data?.ResponseBody);
        //setIsLoading(false);
      } else {
        toast.error(contact?.data?.ResponseMessage);
      }
    } catch (err) {
      //console.log(err);
    }
  };
  useEffect(() => {
    getContactDetails();
  }, []);
  return (
    <>
      <Seo pageTitle="Contact" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <DefaultHeader />
      {/* End Header 1 */}

      {/* <LocationTopBar /> */}
      {/* End location top bar section */}

      <section
        className="section-bg layout-pt-lg layout-pb-lg"
        style={{ backgroundColor: "#19357b" }}
      >
        <div className="container">
          <div className="col-xl-6 col-lg-8 col-md-10">
            <h1 className="text-40 md:text-25 fw-600 text-white">Contact Us</h1>
            <div className="text-25 md:text-15 fw-400 text-white">
              We&#39;re here to help and answer any questions you might have. We
              look forward to hearing from you!
            </div>
          </div>
        </div>
      </section>
      {/* End map section */}
      <section className="layout-pt-md layout-pb-lg">
        <div className="container">
          <div className="row x-gap-80 y-gap-20 justify-between">
            <div className="col-lg-6 col-md-12 maparea">
              <div className="row x-gap-80 y-gap-20 justify-between">
                <div className="col-12">
                  <div className="text-30 sm:text-24 fw-600">
                    Corporate Office
                  </div>
                </div>
                <div className="col-12">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.3409391891415!2d-75.5499287!3d39.745567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6fd405e4bbbff%3A0xa44af1f522cee18e!2s919%20N%20Market%20St%2C%20Wilmington%2C%20DE%2019801%2C%20USA!5e0!3m2!1sen!2sus!4v1692816299621!5m2!1sen!2sus"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <div className="col-6">
                  <div className="text-15 fw-500 mt-10">
                    <FaRegAddressBook />
                    &nbsp;&nbsp;&nbsp;{contactData?.address}
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-15 fw-500 mt-10">
                    <FaMobileScreen />
                    &nbsp;&nbsp;&nbsp;{contactData?.number}
                  </div>
                </div>
                <div className="col-12">
                  <div className="text-15 fw-500 mt-10">
                    <FaRegEnvelope />
                    &nbsp;&nbsp;&nbsp;{contactData?.email}
                  </div>
                </div>
                
              </div>
            </div>
            <div className="col-lg-6 col-md-12 formarea">
              <section className="relative container">
                <div className="row justify-end">
                  <div className="col-12">
                    <div className="map-form px-40 pt-40 pb-50 lg:px-30 lg:py-30 md:px-24 md:py-24 bg-white rounded-4 shadow-4">
                      <h5>Have any queries? Reach out to our team</h5>
                      <p>
                        Please fill in your information. Our travel expert will
                        get back to you soon.
                      </p>
                      <form
                        className="row y-gap-20 pt-20"
                        onSubmit={formik.handleSubmit}
                      >
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
                            <label className="lh-1 text-14 text-light-1">
                              Full Name
                            </label>
                          </div>
                          {formik.touched.name && formik.errors.name && (
                            <span className="text-danger">
                              {formik.errors.name}
                            </span>
                          )}
                        </div>
                        <div className="col-12">
                          <div className="form-input ">
                            <span class="input-group-addon">
                              <i class="glyphicon glyphicon-user"></i>
                            </span>
                            <input
                              type="text"
                              name="email"
                              value={formik.values.email}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            <label className="lh-1 text-14 text-light-1">
                              Email
                            </label>
                          </div>
                          {formik.touched.email && formik.errors.email && (
                            <span className="text-danger">
                              {formik.errors.email}
                            </span>
                          )}
                        </div>
                        <div className="col-12">
                          <div className="form-input ">
                            <span class="input-group-addon">
                              <i class="glyphicon glyphicon-user"></i>
                            </span>
                            <input
                              type="text"
                              name="subject"
                              value={formik.values.subject}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            <label className="lh-1 text-14 text-light-1">
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
                          <div className="form-input ">
                            <span class="input-group-addon">
                              <i class="glyphicon glyphicon-user"></i>
                            </span>
                            <textarea
                              placeholder="Your Message"
                              className="customtextarea"
                              name="message"
                              value={formik.values.message}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              rows={4} // Set the number of rows you want
                            />
                          </div>
                          {formik.touched.message && formik.errors.message && (
                            <span className="text-danger">
                              {formik.errors.message}
                            </span>
                          )}
                        </div>
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
                                Submit
                                <div className="icon-arrow-top-right ml-15" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <DefaultFooter contactData={contactData} />
    </>
  );
};

export default dynamic(() => Promise.resolve(Contact), { ssr: false });
