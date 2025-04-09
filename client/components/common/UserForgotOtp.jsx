"use client";
import Link from "next/link";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
import { request, requestToken } from "../../api/Api";
import { Spinner } from "reactstrap";
import { useRouter } from "next/router";
import ChangePassword from './ChangePassword';

const UserCheckOtp = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState(2);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState("");

  const [resendTimer, setResendTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const otpVerify = async (e) => {
    e.preventDefault();
    if (otp == "" || otp.length != 4) {
      setError("Please enter 4 digit OTP");
    }else{
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
        //status(3);
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
            <h1 className="text-22 fw-500">Enter 4 digit OTP</h1>
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
              className="text-14 fw-500 text-grey-1"
              tabIndex='2'
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
              tabIndex='3'
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

export default UserCheckOtp;
