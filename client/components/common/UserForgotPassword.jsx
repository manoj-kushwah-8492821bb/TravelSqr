"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
import { request, requestToken } from "../../api/Api";
import { Spinner } from "reactstrap";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    email: "",
  };
  const validationSchema = Yup.object({
    email: Yup.string()
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Entered email is invalid')
    .required('Email is required'),
  });

  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    //setEmail(values.email);
    const data = {
      email: values.email,
    };
    const promise = await request("user/forgot-password", data, "post");

    if (promise.error) {
      toast.error('Something went wrong. Try again later.');
    } else {
      if (promise.response.succeeded === true) {
        //setToken(promise.response.ResponseBody.token);
        //toast.success(promise.response.ResponseMessage);
        router.push(
          {
            pathname: "/user/forgot-password-otp-verify",
            query: {
              token: promise.response.ResponseBody.token,
              email: values.email
            },
          }
        );
        setLoading(false);
      } else {
        toast.error(promise.response.ResponseMessage);
        setLoading(false);
      }
    }
    //setLoading(false);
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema,
  });

  const containerStyle = {
    zIndex: 1999,
  };

  return (
    <>
      {/*  */}
        <form className="row y-gap-20" onSubmit={formik.handleSubmit}>
          <div className="col-12">
            <h1 className="text-22 fw-500">Enter Your Email</h1>
          </div>
          {/* End .col */}

          <div className="col-12">
            <div className="form-input">
              <input
                type="text"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <label className="lh-1 text-14 text-light-1">Email</label>
            </div>
            {formik.touched.email && formik.errors.email && (
              <span className="text-danger">{formik.errors.email}</span>
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
                  Send OTP <div className="icon-arrow-top-right ml-15" />
                </>
              )}
            </button>
          </div>
          {/* End .col */}
        </form>
    </>
  );
};

export default SignUpForm;
