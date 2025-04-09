//import AvatarUploader from "./AvatarUploader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";
import {
  requestToken,
  requestTokenUpload,
  getRequestToken,
} from "../../../../api/Api";
import { Spinner } from "reactstrap";
import { BASE_URL, BASE_URL_IMG } from "../../../../config";

const PersonalInfo = () => {
  const [profileData, setProfileData] = useState([]);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState({});

  const getData = async () => {
    const promiseToken = await getRequestToken(
      "user/auth",
      {},
      "get",
      localStorage.getItem("userToken")
    );
    if (promiseToken.error) {
      toast.error("Something went wrong. Try again later.");
    } else {
      setProfileData(promiseToken.response.ResponseBody);
      setImage(
        `${BASE_URL_IMG}${promiseToken.response.ResponseBody.profile_pic}`
      );
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const handleImageChange = (e) => {
    setProfilePic(e.target.files[0]);
    const file = e.target.files[0];
    const reader = new FileReader();

    if (!file) {
      setError("Please select an image.");
      setSuccess(false);
      setProfilePic("");
      return;
    }

    if (file.size > 800 * 1024) {
      setError("Image must be smaller than 800KB.");
      setSuccess(false);
      setProfilePic("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image file is allowed.");
      setSuccess(false);
      setProfilePic("");
      return;
    }

    reader.onload = () => {
      setImage(reader.result);
      setSuccess(true);
      setError("");
    };

    reader.readAsDataURL(file);
  };

  const initialValues = {
    email: profileData.email,
    mobile:profileData.mobile,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
    coins: profileData.coins,
  };
  const validationSchema = Yup.object({
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Entered email is invalid"
      )
      .required("Email is required"),
    first_name: Yup.string()
      .required("First Name Field is Required")
      .matches(
        /^[a-zA-Z]+(\s[a-zA-Z]+)*$/,
        "Only alphabets are allowed with single space between words"
      ),
    last_name: Yup.string()
      .required("Last Name Field is Required")
      .matches(
        /^[a-zA-Z]+(\s[a-zA-Z]+)*$/,
        "Only alphabets are allowed with single space between words"
      ),
    mobile: Yup.string()
      .required("Mobile number is required")
      .matches(/^[^0][0-9]{4,14}$/, "Invalid mobile number")
      .min(5, "Invalid mobile number")
      .max(15, "Invalid mobile number"),
  });
  const onSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    if (error && !success) {
      //console.log('Image error');
      setLoading(false);
    } else {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("mobile", values.mobile);
      formData.append("first_name", values.first_name);
      formData.append("last_name", values.last_name);
      if (profilePic != "") {
        formData.append("profile_pic", profilePic);
      }

      const promise = await requestTokenUpload(
        "user/update",
        formData,
        "post",
        localStorage.getItem("userToken")
      );

      if (promise.error) {
        toast.error("Something went wrong. Try again later.");
        setLoading(false);
      } else {
        if (promise.response.succeeded === true) {
          toast.success(promise.response.ResponseMessage);
          //if(change===true){setChange(false)}else{setChange(true)}
          setLoading(false);
          const promiseToken = await getRequestToken(
            "user/auth",
            {},
            "get",
            localStorage.getItem("userToken")
          );
          localStorage.setItem(
            "name",
            `${promiseToken.response.ResponseBody.first_name} ${promiseToken.response.ResponseBody.last_name}`
          );
          localStorage.setItem(
            "profile",
            promiseToken.response.ResponseBody.profile_pic
          );
          setProfileData(promiseToken.response.ResponseBody);
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
  return (
    <>
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        style={containerStyle}
      /> */}
      <form className="col-xl-6" onSubmit={formik.handleSubmit}>
        <div className="row x-gap-20 y-gap-20">
          <div className="col-auto">
            {image ? (
              <div className="d-flex ratio ratio-1:1 w-200">
                <img
                  width={200}
                  height={200}
                  src={image}
                  alt="avatar"
                  className="img-ratio rounded-4"
                  onError={(e) => {
                    e.target.src = "/img/profile.png";
                  }}
                />
                {/* <div className="d-flex justify-end px-10 py-10 h-100 w-1/1 absolute">
                  <div
                    className="size-40 bg-white rounded-4 flex-center cursor-pointer"
                    onClick={() => {
                      setImage(""), setProfilePic("");
                    }}
                  >
                    <i className="icon-trash text-16" />
                  </div>
                </div> */}
              </div>
            ) : (
              <div className="d-flex ratio ratio-1:1 w-200">
                <img
                  width={200}
                  height={200}
                  src={`${BASE_URL_IMG}${profileData.profile_pic}`}
                  alt="image"
                  className="img-ratio rounded-4"
                  onError={(e) => {
                    e.target.src = "/img/profile.png";
                  }}
                />
                {/* <div className="d-flex justify-end px-10 py-10 h-100 w-1/1 absolute">
                  <div className="size-40 bg-white rounded-4 flex-center cursor-pointer">
                    <i className="icon-trash text-16" />
                  </div>
                </div> */}
              </div>
            )}
          </div>

          <div className="col-auto">
            <h4 className="text-16 fw-500">Your avatar</h4>
            <div className="text-14 mt-5">
              PNG or JPG no bigger than 800px wide and tall.
            </div>
            <div className="d-inline-block mt-15">
              <label
                htmlFor="avatar-upload"
                role="button"
                className="button h-50 px-24 -dark-1 bg-blue-1 text-white"
              >
                <i className="icon-upload-file text-20 mr-10" />
                Browse
              </label>
              <input
                name="profile"
                type="file"
                id="avatar-upload"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
            {error && !success && (
              <div className="text-red-1 mt-1">{error}</div>
            )}
          </div>
        </div>

        <div className="border-top-light mt-30 mb-30" />

        <div className="col-xl-9">
          <div className="row x-gap-20 y-gap-20">
            <div className="col-12">
              <div className="form-input ">
                <input
                  type="text"
                  value={formik.values.first_name}
                  //defaultValue={profileData.name}
                  name="first_name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={25}
                />
                <label className="lh-1 text-16 text-light-1">First Name</label>
              </div>
              {formik.touched.first_name && formik.errors.first_name && (
                <span className="text-danger">{formik.errors.first_name}</span>
              )}
            </div>

            <div className="col-12">
              <div className="form-input ">
                <input
                  type="text"
                  value={formik.values.last_name}
                  //defaultValue={profileData.last_name}
                  name="last_name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={25}
                />
                <label className="lh-1 text-16 text-light-1">Last Name</label>
              </div>
              {formik.touched.last_name && formik.errors.last_name && (
                <span className="text-danger">{formik.errors.last_name}</span>
              )}
            </div>

            <div className="col-md-12">
              <div className="form-input ">
                <input
                  type="text"
                  name="email"
                  value={formik.values.email}
                  //defaultValue={profileData.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={true}
                />
                <label
                  className="lh-1 text-16 text-light-1"
                  style={{ marginTop: "-10px" }}
                >
                  Email
                </label>
              </div>
              {formik.touched.email && formik.errors.email && (
                <span className="text-danger">{formik.errors.email}</span>
              )}
            </div>

            <div className="col-md-12">
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

          </div>
        </div>
        {/* End col-xl-9 */}

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
                Save Changes <div className="icon-arrow-top-right ml-15" />
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default PersonalInfo;
