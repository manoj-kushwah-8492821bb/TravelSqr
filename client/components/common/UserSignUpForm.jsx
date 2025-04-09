"use client";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { request, requestToken } from "../../api/Api";
import { Spinner } from "reactstrap";

const SignUpForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
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
      .matches(/^[a-zA-Z]+$/, "Only alphabets are allowed")
      .min(2, "First name must be at least 2 characters")
      .max(25, "First name must be at most 25 characters"),
    lastName: Yup.string()
      .required("Last name is required")
      .matches(/^[a-zA-Z]+$/, "Only alphabets are allowed")
      .min(2, "Last name must be at least 2 characters")
      .max(25, "Last name must be at most 25 characters"),
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Entered email is invalid"
      )
      .required("Email is required"),
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
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must be at most 50 characters"),
    // confirmPassword: Yup.string().oneOf(
    //   [Yup.ref("password"), null],
    //   "Passwords must match"
    // ),
  });

  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const data = {
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      mobile: values.mobile,
      password: values.password,
    };
    const promise = await requestToken("user/register", data, "post", token);

    if (promise.error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    } else {
      if (promise.response.succeeded === true) {
        //setStatus(2);
        //setToken(promise.response.ResponseBody.token);
        router.push({
          pathname: "/user/otp-verify",
          query: {
            token: promise.response.ResponseBody.token,
            email: values.email,
          },
        });
        //toast.success(promise.response.ResponseMessage);
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

  // useEffect(()=>{
  //   router.push(
  //     {
  //       pathname: "/user/otp-verify",
  //       query: {
  //         token: 'sdcsdcdscsd',
  //         email: "sdfsd"
  //       },
  //     }
  //   );
  // })

  return (
    <>
      {/*  */}

      <form className="row y-gap-20" onSubmit={formik.handleSubmit}>
        <div className="col-12">
          <h1 className="text-22 fw-500">Welcome</h1>
          <p className="mt-10">
            Already have an account?{" "}
            <Link href="/user/login" className="text-blue-1">
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
              maxLength={25}
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
              maxLength={25}
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
              maxLength={100}
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
              maxLength={50}
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

        {/* <div className="col-12">
          <div className="d-flex ">
            <div className="form-checkbox mt-5">
              <input type="checkbox" name="name" />
              <div className="form-checkbox__mark">
                <div className="form-checkbox__icon icon-check" />
              </div>
            </div>
            <div className="text-15 lh-15 text-light-1 ml-10">
              Email me exclusive promotions. I can opt out later as stated in the
              Privacy Policy.
            </div>
          </div>
        </div> */}
        {/* End .col */}

        <div className="d-flex justify-content-center align-items-center pt-30">
          <button
            type="submit"
            className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
            disabled={loading}
            tabIndex={7}
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
        <div className="row y-gap-20 pt-30">
          {/* <div className="col-12">
              <div className="text-center">or sign in with</div>
            </div> */}
          {/* <LoginWithSocial /> */}
          <div className="col-12">
            <div className="text-center px-30">
              By creating an account, you agree to our Terms of Service and
              Privacy Statement.
            </div>
          </div>
        </div>
        {/* End .col */}
      </form>
    </>
  );
};

export default SignUpForm;
