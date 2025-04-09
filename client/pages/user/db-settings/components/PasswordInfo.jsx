import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { useState } from "react";
import { requestToken } from "../../../../api/Api";
import { Spinner } from "reactstrap";

const PasswordInfo = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old_password: "password",
    new_password: "password",
    confirm_password: "password",
  });
  const initialValues = {
    old_password: "",
    new_password: "",
    confirm_password: "",
  };
  const validationSchema = Yup.object({
    old_password: Yup.string().required("Current password field is required"),
    new_password: Yup.string()
      .required("New password filed is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      )
      .min(8, "New password must be at least 8 characters")
      .max(16, "New password must be at most 25 characters"),
    confirm_password: Yup.string()
      .required("Confirm password field is required")
      .oneOf(
        [Yup.ref("new_password"), null],
        "New password and Confirm pasword must be same"
      ),
  });

  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const data = {
      old_password: values.old_password,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    };
    const promise = await requestToken(
      "user/change-password",
      data,
      "post",
      localStorage.getItem("userToken")
    );

    if (promise.error) {
      toast.error(promise.error.response.data.ResponseMessage);
      setLoading(false);
    } else {
      if (promise.response.succeeded === true) {
        toast.success(promise.response.ResponseMessage);
        resetForm();
      } else {
        toast.error(promise.response.ResponseMessage);
      }
      setLoading(false);
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
      <form className="col-xl-6" onSubmit={formik.handleSubmit}>
        <div className="row x-gap-20 y-gap-20">
          <div className="col-12">
            <div className="form-input ">
              <input
                name="old_password"
                value={formik.values.old_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type={showPassword.old_password}
                style={{
                  borderRight: "none",
                  width: "85%",
                  borderTopRightRadius: "0px",
                  borderBottomRightRadius: "0px",
                }}
                tabIndex={1}
              />
              <span className="showPassword">
                {showPassword.old_password === "text" ? (
                  <img
                    src="/img/icon/eyeOpen.png"
                    width={"60%"}
                    alt="logo icon"
                    onClick={() => {
                      setShowPassword({
                        ...showPassword,
                        old_password: "password",
                      });
                    }}
                    onKeyPress={(event) => {
                      // Check if the key pressed is the "Enter" key
                      if (event.key === "Enter") {
                        setShowPassword({
                          ...showPassword,
                          old_password: "password",
                        });
                      }
                    }}
                    tabIndex={2}
                    role="button"
                  />
                ) : (
                  <img
                    src="/img/icon/eyesClose.png"
                    width={"60%"}
                    alt="logo icon"
                    onClick={() => {
                      setShowPassword({
                        ...showPassword,
                        old_password: "text",
                      });
                    }}
                    onKeyPress={(event) => {
                      // Check if the key pressed is the "Enter" key
                      if (event.key === "Enter") {
                        setShowPassword({
                          ...showPassword,
                          old_password: "text",
                        });
                      }
                    }}
                    tabIndex={2}
                    role="button"
                  />
                )}
              </span>
              <label className="lh-1 text-16 text-light-1">
                Current Password
              </label>
            </div>
            {formik.touched.old_password && formik.errors.old_password && (
              <span className="text-danger">{formik.errors.old_password}</span>
            )}
          </div>
          {/* End col-12 */}

          <div className="col-12">
            <div className="form-input ">
              <input
                name="new_password"
                value={formik.values.new_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type={showPassword.new_password}
                style={{
                  borderRight: "none",
                  width: "85%",
                  borderTopRightRadius: "0px",
                  borderBottomRightRadius: "0px",
                }}
                tabIndex={3}
              />
              <span className="showPassword">
                {showPassword.new_password === "text" ? (
                  <img
                    src="/img/icon/eyeOpen.png"
                    width={"60%"}
                    alt="logo icon"
                    onClick={() => {
                      setShowPassword({
                        ...showPassword,
                        new_password: "password",
                      });
                    }}
                    onKeyPress={(event) => {
                      // Check if the key pressed is the "Enter" key
                      if (event.key === "Enter") {
                        setShowPassword({
                          ...showPassword,
                          new_password: "password",
                        });
                      }
                    }}
                    tabIndex={4}
                    role="button"
                  />
                ) : (
                  <img
                    src="/img/icon/eyesClose.png"
                    width={"60%"}
                    alt="logo icon"
                    onClick={() => {
                      setShowPassword({
                        ...showPassword,
                        new_password: "text",
                      });
                    }}
                    onKeyPress={(event) => {
                      // Check if the key pressed is the "Enter" key
                      if (event.key === "Enter") {
                        setShowPassword({
                          ...showPassword,
                          new_password: "text",
                        });
                      }
                    }}
                    tabIndex={4}
                    role="button"
                  />
                )}
              </span>
              <label className="lh-1 text-16 text-light-1">New Password</label>
            </div>
            {formik.touched.new_password && formik.errors.new_password && (
              <span className="text-danger">{formik.errors.new_password}</span>
            )}
          </div>
          {/* End col-12 */}

          <div className="col-12">
            <div className="form-input ">
              <input
                name="confirm_password"
                value={formik.values.confirm_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type={showPassword.confirm_password}
                style={{
                  borderRight: "none",
                  width: "85%",
                  borderTopRightRadius: "0px",
                  borderBottomRightRadius: "0px",
                }}
                tabIndex={5}
              />
              <span className="showPassword">
                {showPassword.confirm_password === "text" ? (
                  <img
                    src="/img/icon/eyeOpen.png"
                    width={"60%"}
                    alt="logo icon"
                    onClick={() => {
                      setShowPassword({
                        ...showPassword,
                        confirm_password: "password",
                      });
                    }}
                    onKeyPress={(event) => {
                      // Check if the key pressed is the "Enter" key
                      if (event.key === "Enter") {
                        setShowPassword({
                          ...showPassword,
                          confirm_password: "password",
                        });
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
                      setShowPassword({
                        ...showPassword,
                        confirm_password: "text",
                      });
                    }}
                    onKeyPress={(event) => {
                      // Check if the key pressed is the "Enter" key
                      if (event.key === "Enter") {
                        setShowPassword({
                          ...showPassword,
                          confirm_password: "text",
                        });
                      }
                    }}
                    tabIndex={6}
                    role="button"
                  />
                )}
              </span>
              <label className="lh-1 text-16 text-light-1">
                Confirm Password
              </label>
            </div>
            {formik.touched.confirm_password &&
              formik.errors.confirm_password && (
                <span className="text-danger">
                  {formik.errors.confirm_password}
                </span>
              )}
          </div>
          {/* End col-12 */}

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
                  Change <div className="icon-arrow-top-right ml-15" />
                </>
              )}
            </button>
          </div>
          {/* End col-12 */}
        </div>
      </form>
    </>
  );
};

export default PasswordInfo;
