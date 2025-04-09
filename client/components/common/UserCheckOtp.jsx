"use client";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
import { requestToken, getRequestToken } from "../../api/Api";
import { Spinner } from "reactstrap";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { LoginSuccess } from "../../features/LoginAuthSlice";
import { RouteChange } from "../../features/GuestUserSlice";
import { useSelector } from "react-redux";

const UserCheckOtp = () => {
  const router = useRouter();
  let route = useSelector((state) => state?.GuestUserSlice?.route);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState(2);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(null);
  const [email, setEmail] = useState("");

  const [resendTimer, setResendTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // const startResendTimer = () => {
  //   setResendTimer(60); // Set the timer to 60 seconds
  //   setIsResendDisabled(true); // Disable the Resend OTP button
  // };

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
      // Add logic to resend OTP
      try {
        const data = {
          email: email,
          type: 2,
        };
        const promise = await requestToken("user/resend", data, "post", token);
    
        if (promise.error) {
          toast.error('Something went wrong. Please try again.');
        } else {
          if (promise.response.succeeded === true) {
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
      } catch (error) {
        // Handle errors
        console.error("Error resending OTP:", error);
      }
  };

  const containerStyle = {
    zIndex: 1999,
  };

  function setCookie(name, value, days) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
  
    const cookieValue = encodeURIComponent(value) + "; expires=" + expirationDate.toUTCString() + "; path=/";
  
    document.cookie = name + "=" + cookieValue;
  }

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
        toast.error("Something went wrong. Please try again later.");
        setLoading(false);
      } else {
        if (promise.response.succeeded === true) {

          const promiseToken = await getRequestToken("user/auth", {}, "get", promise.response.ResponseBody.token);
          if(promiseToken.error){
            toast.error('Something went wrong. Please try again later.');
          }else{
            if(promise.response.succeeded===true){
              setCookie("userToken", promise.response.ResponseBody.token, 1);
              localStorage.setItem("userToken", promise.response.ResponseBody.token);
              localStorage.setItem("name", `${promiseToken.response.ResponseBody.first_name} ${promiseToken.response.ResponseBody.last_name}`);
              localStorage.setItem("profile", promiseToken.response.ResponseBody.profile_pic);
              dispatch(LoginSuccess(promise.response.ResponseBody.token));
              if(JSON.stringify(route) === '{}'){
                router.push("/")
              }else{
                dispatch(RouteChange({}))
                router.push(route)
              }
              
              //router.back();
            }else{
              toast.error(promise.response.ResponseMessage);
            }
          }



          //setStatus(3);
          //setToken(promise.response.ResponseBody.token);
          //toast.success(promise.response.ResponseMessage);
          //resetForm();
          //setLoading(false);
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
  // const resendOtp = async () => {
  //   //e.preventDefault();
  //   const data = {
  //     email: email,
  //     type: 2,
  //   };
  //   const promise = await requestToken("user/resend", data, "post", token);

  //   if (promise.error) {
  //     toast.error('Something went wrong. Please try again.');
  //   } else {
  //     if (promise.response.succeeded === true) {
  //       startResendTimer();
  //       setToken(promise.response.ResponseBody.token);
  //       toast.success(promise.response.ResponseMessage);
  //       //setLoading(false);
  //     } else {
  //       toast.error(promise.response.ResponseMessage);
  //       //setLoading(false);
  //     }
  //   }
  // };
  useEffect(() => {
    setToken(router?.query?.token);
    setEmail(router?.query?.email);
  }, [router?.query]);

  // useEffect(() => {
  //   if (!isInitialLoad && performance.navigation.type === 1) {
  //     router.replace('/user/signup');
  //   }
  // }, [isInitialLoad]);

  // useEffect(() => {
  //   const handleBeforeUnload = (event) => {
  //     const message = "Are you sure you want to leave?";
  //     event.returnValue = message; // Standard for most browsers

  //     // Use Navigation Timing API to get more information about the navigation
  //     const navigationEntries = performance.getEntriesByType("navigation");
  //     if (navigationEntries.length > 0) {
  //       const navigationEntry = navigationEntries[0];
  //       const navigationType = navigationEntry.type;
  //       // Determine if it's a reload or cancel
  //       if (navigationType === "reload") {
  //         //console.log("Reload button pressed");
  //       } else {
  //         //console.log("Cancel button pressed");
  //       }
  //     }

  //     return message; // For some older browsers
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);

  return (
    <>
      {/*  */}

      {status === 3 ? (
        <div className="col-12">
          {/* <h1 className="text-22 fw-500">Welcome back</h1> */}
          <p className="mt-10">
            Your account has been successfully created.
            <Link href="/user/login" className="text-blue-1">
              Log in
            </Link>
          </p>
        </div>
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
            {/* <button
                className="text-14 fw-500 text-blue-1 underline"
                onClick={resendOtp}
              >
                Resend OTP
              </button> */}
            {!isResendDisabled?
            <Link
              className="text-14 fw-500 text-blue-1 underline"
              onClick={handleResendOtp}
              tabIndex='2'
              href='#'
            >
              Resend OTP 
            </Link>:<span
              className="text-14 fw-500 text-grey-1"
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
