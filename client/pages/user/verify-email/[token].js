"use client";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import CallToActions from "../../../components/common/CallToActions";
import Seo from "../../../components/common/Seo";
import DefaultHeader from "../../../components/header/header";
import DefaultFooter from "../../../components/footer/footer";
import ChangePassword from "../../../components/common/ChangePassword";
import Footer from "../../../components/footer/footer";
import { useEffect, useState } from "react";
import { requestToken } from "../../../api/Api";
import toast from "react-hot-toast";

import Link from "next/link";

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const [token, settToken] = useState('');
  const router = useRouter();
  const emailToken = router.query.token;
  const [status, setStatus] = useState(true);
  const [message, setMessage] = useState("");

  const vefifyToken = async (tokenData) => {
    const data = {};
    const promise = await requestToken(
      "user/verify",
      data,
      "post",
      tokenData
    );
    if (promise.error) {
      //toast.error(promise.response.ResponseMessage);
      setMessage(promise.error.response.data.ResponseMessage);
      setLoading(false);
    } else {
      if (promise.response.succeeded === true) {
        //toast.success(promise.response.ResponseMessage);
        settToken(promise.response.ResponseBody.token)
        setMessage(promise.response.ResponseMessage);
        setStatus(false);
      } else {
        //toast.error(promise.response.ResponseMessage);
        setMessage(promise.response.ResponseMessage);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if(emailToken!=undefined){
      vefifyToken(router.query.token);
    }
  }, [emailToken]);

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
      <Seo pageTitle="Verify Email" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <DefaultHeader />
      {/* End Header 1 */}

      <section className="layout-pt-lg layout-pb-lg bg-blue-2">
        <div className="container">
          <div className="row justify-center">
            <div className="col-xl-6 col-lg-7 col-md-9">
              <div className="px-50 py-50 sm:px-20 sm:py-20 bg-white shadow-4 rounded-4">
              {status?
                <>
                <h1 className="text-22 fw-500">Link expired. Please click following link to generate new link.</h1>
                <div className="col-12">
                  <Link href="/admin/forgot-password" className="text-14 fw-500 text-blue-1 underline">
                    Forgot your password?
                  </Link>
                </div>
                </>
              :<ChangePassword token={token}/>}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End login section */}

      
      {/* End Call To Actions Section */}

      <Footer />
      {/* End Call To Actions Section */}
    </>
  );
};

export default dynamic(() => Promise.resolve(SignUp), { ssr: false });
