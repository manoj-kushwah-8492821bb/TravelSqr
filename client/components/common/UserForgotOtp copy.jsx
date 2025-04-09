"use client";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
import { request, requestToken } from "../../api/Api";
import { Spinner } from "reactstrap";
import ChangePassword from './ChangePassword';
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const router = useRouter();console.log(router.query)
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState(2);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(null);
  const [email, setEmail] = useState("");

  const [resendTimer, setResendTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

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
    setEmail(values.email);
    const data = {
      email: values.email,
    };
    const promise = await request("user/forgot-password", data, "post");

    if (promise.error) {
      toast.error(promise.error.response.data.ResponseMessage);
    } else {
      if (promise.response.succeeded === true) {
        setStatus(2);
        setToken(promise.response.ResponseBody.token);
        toast.success(promise.response.ResponseMessage);
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

  const otpVerify = async (e) => {
    e.preventDefault();
    if (error == "") {
      setLoading(true);
      const data = {
        otp: otp,
      };
      const promise = await requestToken("user/verify", data, "post", token);

      if (promise.error) {
        toast.error(promise.error.response.data.ResponseMessage);
        setLoading(false);
      } else {
        if (promise.response.succeeded === true) {
          setStatus(3);
          setToken(promise.response.ResponseBody.token);
          toast.success(promise.response.ResponseMessage);
          //resetForm();
          setLoading(false);
        } else {
          toast.error(promise.response.ResponseMessage);
          setLoading(false);
        }
      }
    }
  };
  const otpChange = (e) => {
    if (e.target.value == "" || e.target.value.length != 4) {
      setError("Please enter 4 digit OTP");
      setOtp(e.target.value);
    } else {
      setOtp(e.target.value);
      setError("");
    }
  };

  useEffect(() => {
    let timerInterval;

    if (resendTimer > 0) {
      timerInterval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false); // Enable the Resend OTP button when the timer reaches 0
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [resendTimer]);

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setOtp('');
    const data = {
      email: email,
      type: 2,
    };
    const promise = await requestToken("user/resend", data, "post", token);

    if (promise.error) {
      toast.error('Something went wrong. Try again later');
    } else {
      if (promise.response.succeeded === true) {
        status(3);
        setResendTimer(60); // Set the timer to 60 seconds
        setIsResendDisabled(true); // Disable the Resend OTP button
        setToken(promise.response.ResponseBody.token);
        toast.success(promise.response.ResponseMessage);
        //setLoading(false);
      } else {
        toast.error(promise.response.ResponseMessage);
        //setLoading(false);
      }
    }
  };
  useEffect(() => {
    setToken(router?.query?.token);
    setEmail(router?.query?.email);
  }, [router?.query]);
  return (
    <>
      {/*  */}
      {status === 3 ? (
        <ChangePassword token={token}  />
      ) : (
        <form>
          <div className="col-12">
            <h1 className="text-22 fw-500">{JSON.stringify(token)}Enter 4 digit OTP1</h1>
          </div>
          <div className="col-12">
            <div className="form-input ">
              <input
                type="number"
                name="otp"
                value={otp}
                onChange={otpChange}
                tabIndex='1'
              />
              <label className="lh-1 text-14 text-light-1">OTP</label>
            </div>
            <span className="text-danger">{error}</span>
          </div>
          <div className="col-12">
            {!isResendDisabled?
            <Link
              className="text-14 fw-500 text-blue-1 underline"
              onClick={handleResendOtp}
              tabIndex='-1'
              href='#'
            >
              Resend OTP 
            </Link>:<span
              className="text-14 fw-500 text-grey-1 underline"
              tabIndex='-1'
            >
              Resend OTP 
            </span>} {resendTimer > 0 && `${resendTimer}s`}
          </div>
          <div className="d-flex justify-content-center align-items-center pt-30">
            <button
              type="submit"
              className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
              onClick={otpVerify}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner></Spinner>&nbsp;Loading...
                </>
              ) : (
                <>
                  Verify <div className="icon-arrow-top-right ml-15" />
                </>
              )}
            </button>
          </div>
          {/* End .col */}
        </form>
      )}
    </>
  );
};

export default SignUpForm;
