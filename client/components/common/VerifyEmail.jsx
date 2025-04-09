"use client";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { useState } from "react";
import { request } from "../../api/Api";
import { Spinner } from "reactstrap";

const SignUpForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState("password");
  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    // confirmPassword: "",
  };
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required("First name is required")
      .matches(/^[a-zA-Z]+$/, "Only alphabet are allowed")
      .min(2, "First name must be at least 2 characters")
      .max(25, "First name must be at most 25 characters"),
    lastName: Yup.string()
      .required("Last name is required")
      .matches(/^[a-zA-Z]+$/, "Only alphabet are allowed")
      .min(2, "Last name must be at least 2 characters")
      .max(25, "Last name must be at most 25 characters"),
      email: Yup.string()
      .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Entered email is invalid')
      .required('Email is required'),
    mobile: Yup.string()
      .required("Mobile Field is Required")
      .min(5, "Enter the Valid Mobile Number")
      .max(15, "Enter the Valid Mobile Number"),
    password: Yup.string()
      .required("Password Field is Required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      )
      .min(8, "Password must be at least 8 characters"),
    // confirmPassword: Yup.string().oneOf(
    //   [Yup.ref("password"), null],
    //   "Passwords must match"
    // ),
  });

  const onSubmit = async (values,{ resetForm }) => {
    setLoading(true);
    const data = {
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      mobile: values.mobile,
      password: values.password,
    };
    const promise = await request("user/register", data, "post");

    if(promise.error){
      toast.error(promise.response.ResponseMessage);
    }else{
      if(promise.response.succeeded===true){
        toast.success(promise.response.ResponseMessage);
        resetForm();
        setLoading(false);
      }else{
        toast.error(promise.response.ResponseMessage);
        setLoading(false);
      }
    }
    setLoading(false);
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
          <h1 className="text-22 fw-500">Welcome back</h1>
          <p className="mt-10">
            Already have an account yet?{" "}
            <Link href="/others-pages/login" className="text-blue-1">
              Log in
            </Link>
          </p>
        </div>
        {/* End .col */}

        <div className="col-12">
          <div className="form-input ">
            <span class="input-group-addon">
              <i class="glyphicon glyphicon-user"></i>
            </span>
            <input
              type="text"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              tabIndex={1}
            />
            <label className="lh-1 text-14 text-light-1">First Name</label>
          </div>
          {formik.touched.firstName && formik.errors.firstName && (
            <span className="text-danger">{formik.errors.firstName}</span>
          )}
        </div>
        {/* End .col */}

        <div className="col-12">
          <div className="form-input ">
            <input
              type="text"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              tabIndex={2}
            />
            <label className="lh-1 text-14 text-light-1">Last Name</label>
          </div>
          {formik.touched.lastName && formik.errors.lastName && (
            <span className="text-danger">{formik.errors.lastName}</span>
          )}
        </div>
        {/* End .col */}

        <div className="col-12">
          <div className="form-input ">
            <input
              type="text"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              tabIndex={3}
            />
            <label className="lh-1 text-14 text-light-1">Email</label>
          </div>
          {formik.touched.email && formik.errors.email && (
            <span className="text-danger">{formik.errors.email}</span>
          )}
        </div>

        {/* End .col */}
        <div className="col-12">
          <div className="form-input ">
            <input
              type="number"
              name="mobile"
              value={formik.values.mobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              tabIndex={4}
            />
            <label className="lh-1 text-14 text-light-1">Mobile</label>
          </div>
          {formik.touched.mobile && formik.errors.mobile && (
            <span className="text-danger">{formik.errors.mobile}</span>
          )}
        </div>
        {/* End .col */}

        <div className="col-12">
          <div className="form-input">
            <input
              type={showPassword}
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              style={{
                borderRight: "none",
                width: "85%",
                borderTopRightRadius: "0px",
                borderBottomRightRadius: "0px",
              }}
              tabIndex={5}
            />
            <span className="showPassword" style={{ cursor: "pointer" }}>
              {showPassword === "text" ? (
                <img
                  src="/img/icon/eyeOpen.png"
                  width={"60%"}
                  alt="logo icon"
                  onClick={() => {
                    setShowPassword("password");
                  }}
                  onKeyPress={(event) => {
                    // Check if the key pressed is the "Enter" key
                    if (event.key === "Enter") {
                      setShowPassword("password");
                    }
                  }}
                  tabIndex={6}
                  role="button"
                />
              ) : (
                <img
                  src="/img/icon/eyesClose.png"
                  width={"60%"}
                  alt="logo icon"
                  onClick={() => {
                    setShowPassword("text");
                  }}
                  onKeyPress={(event) => {
                    // Check if the key pressed is the "Enter" key
                    if (event.key === "Enter") {
                      setShowPassword("text");
                    }
                  }}
                  tabIndex={6}
                  role="button"
                />
              )}
            </span>

            <label className="lh-1 text-14 text-light-1">Password</label>
          </div>
          {formik.touched.password && formik.errors.password && (
            <span className="text-danger">{formik.errors.password}</span>
          )}
        </div>
        {/* End .col */}

        {/* <div className="col-12">
          <div className="form-input ">
            <input
              type="text"
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <label className="lh-1 text-14 text-light-1">Confirm Password</label>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span className="text-danger">{formik.errors.confirmPassword}</span>
          )}
        </div> */}
        {/* End .col */}

        <div className="col-12">
          <div className="d-flex ">
            <div className="form-checkbox mt-5">
              <input type="checkbox" name="name" />
              <div className="form-checkbox__mark">
                <div className="form-checkbox__icon icon-check" tabIndex={7}/>
              </div>
            </div>
            <div className="text-15 lh-15 text-light-1 ml-10">
              Email me exclusive promotions. I can opt out later as stated in the
              Privacy Policy.
            </div>
          </div>
        </div>
        {/* End .col */}

        <div className="col-12">
          <button
            type="submit"
            className="button py-20 -dark-1 bg-blue-1 text-white w-100"
            disabled={loading}
            tabIndex={8}
          >
            {loading ? (
              <>
                <Spinner></Spinner>&nbsp;Loading...
              </>
            ) : (
              <>
                Sign Up <div className="icon-arrow-top-right ml-15" />
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
