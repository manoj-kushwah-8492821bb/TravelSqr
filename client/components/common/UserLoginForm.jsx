"use client";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { LoginSuccess } from "../../features/LoginAuthSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// import { FaEye } from "react-icons/fa6";
// import { FaEyeSlash } from "react-icons/fa6";
import { useState } from "react";
import { request, requestToken, getRequestToken } from "../../api/Api";
import { Spinner } from "reactstrap";

const LoginForm = () => {

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState("password");
  const dispatch = useDispatch();
  const router = useRouter();
  const initialValues = {
    email: "",
    password: "",
  };
  const validationSchema = Yup.object({
    email: Yup.string()
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Entered email is invalid')
    .required('Email is required'),
    password: Yup.string().required("Password field is required"),
  });

  function setCookie(name, value, days) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
  
    const cookieValue = encodeURIComponent(value) + "; expires=" + expirationDate.toUTCString() + "; path=/";
  
    document.cookie = name + "=" + cookieValue;
  }
  const onSubmit = async (values, { setSubmitting }) => {
    
    setLoading(true);
    const data = {
      email: values.email,
      password: values.password,
    };
    const promise = await request("user/login", data, "post");
    //console.log(promise);
    if(promise.error){
      toast.error('Something went wrong. Please try again later.');
    }else{
      if(promise?.response?.succeeded===true){
        //setLoading(false);
        //console.log(promise.response.ResponseBody.token);
        const promiseToken = await getRequestToken("user/auth", {}, "get", promise.response.ResponseBody.token);
        if(promiseToken.error){
          toast.error('Something went wrong. Please try again later.');
          setLoading(false);
        }else{
          //cookies().set('token', promise.response.ResponseBody.token);
          if(promiseToken?.response?.succeeded===true){
            setCookie("userToken", promise.response.ResponseBody.token, 1);
            localStorage.setItem("userToken", promise.response.ResponseBody.token);
            localStorage.setItem("name", `${promiseToken.response.ResponseBody.first_name} ${promiseToken.response.ResponseBody.last_name}`);
            localStorage.setItem("profile", promiseToken.response.ResponseBody.profile_pic);
            dispatch(LoginSuccess(promise.response.ResponseBody.token));
            router.push("/");
            //router.back();
          }else{
            toast.error(promiseToken.response.ResponseMessage);
            setLoading(false);
          }
        }
      }else{
        if(promise.response.ResponseMessage=='Invalid Password!'){
          toast.error('Invalid Username / Password');
        }else{
          toast.error(promise.response.ResponseMessage);
        }
        if(promise.response.ResponseBody.verified===false){
          try {
            const data = {
              email: values.email,
              type: 2,
            };
            const promise1 = await request("user/resend", data, "post");
        
            if (promise.error) {
              toast.error('Something went wrong. Please try again.');
              setLoading(false);
            } else {
              if (promise1.response.succeeded === true) {
                router.push(
                  {
                    pathname: "/user/otp-verify",
                    query: {
                      token: promise1.response.ResponseBody.token,
                      email: values.email
                    },
                  }
                );
                //setLoading(false);
              } else {
                toast.error(promise1.response.ResponseMessage);
                setLoading(false);
              }
            }
          } catch (error) {
            // Handle errors
            toast.error('Error sending OTP.');
            setLoading(false);
          }
        }else{
          setLoading(false);
        }
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
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        style={containerStyle}
      /> */}
      <form className="row y-gap-20" onSubmit={formik.handleSubmit}>
        <div className="col-12">
          <h1 className="text-22 fw-500">Please Login</h1>
          <p className="mt-10">
            Don&apos;t have an account yet?{" "}
            <Link href="/user/signup" className="text-blue-1">
              Sign up
            </Link>
          </p>
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
              tabIndex={1}
            />
            <label className="lh-1 text-14 text-light-1">Email</label>
          </div>
          {formik.touched.email && formik.errors.email && (
            <span className="text-danger">{formik.errors.email}</span>
          )}
        </div>

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
              tabIndex={2}
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
                  tabIndex={3}
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
                  tabIndex={3}
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

        <div className="col-12">
          <Link href="/user/forgot-password" className="text-14 fw-500 text-blue-1 underline" tabIndex={4}>
            Forgot your password?
          </Link>
        </div>
        {/* End .col */}

        <div className="d-flex justify-content-center align-items-center pt-30">
          <button
            type="submit"
            className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
            disabled={loading}
            tabIndex={5}
          >
            {loading ? (
              <>
                <Spinner></Spinner>&nbsp;Loading...
              </>
            ) : (
              <>
                Sign In <div className="icon-arrow-top-right ml-15" />
              </>
            )}
          </button>
        </div>
        {/* End .col */}
      </form>
    </>
  );
};

export default LoginForm;
