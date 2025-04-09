"use client";
// import { cookies } from 'next/headers'
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { useState } from "react";
import { request, requestToken } from "../../api/Api";
import { Spinner } from "reactstrap";
import { useRouter } from 'next/router';

const ForgotPassword = () => {

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
    const data = {
      email: values.email,
    };
    const promise = await request("admin/forgot-password", data, "post");

    if(promise.error){
      toast.error(promise.response.ResponseMessage);
      setLoading(false);s
    }else{
      if(promise.response.succeeded===true){
        toast.success(promise.response.ResponseMessage);
        setTimeout(()=>{
          router.push("/admin");
        },[3000])
        // setLoading(false);
        // resetForm();
      }else{
        toast.error(promise.response.ResponseMessage);
        setLoading(false);
      }
    }

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
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        style={containerStyle}
      /> */}
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
                Send Link <div className="icon-arrow-top-right ml-15" />
              </>
            )}
          </button>
        </div>
        {/* End .col */}
      </form>
    </>
  );
};

export default ForgotPassword;
