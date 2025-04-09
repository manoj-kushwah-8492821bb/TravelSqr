import Seo from "../../components/common/Seo";
import Header10 from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ConfirmBooking from "../../components/booking-page/ConfirmBooking";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { getRequestToken } from "../../api/Api";

const Index = () => {

  const router = useRouter();
  function setCookie(name, value, days) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const cookieValue =
      encodeURIComponent(value) +
      "; expires=" +
      expirationDate.toUTCString() +
      "; path=/";

    document.cookie = name + "=" + cookieValue;
  }
  const checkAuth = async () => {
    const promiseToken = await getRequestToken('user/auth', {}, "get", localStorage.getItem("userToken"));
    if (promiseToken.error) {
      if (promiseToken?.error?.response?.data?.ResponseCode === 401) {
        setCookie("userToken", undefined, 0);
        localStorage.removeItem("userToken");
        localStorage.removeItem("name");
        localStorage.removeItem("profile");
        router.push("/");
      }
    } else {
      if(promiseToken.response.ResponseBody.status!==1){
        //toast.error("User inactive.");
        setCookie("userToken", undefined, 0);
        localStorage.removeItem("userToken");
        localStorage.removeItem("name");
        localStorage.removeItem("profile");
        router.push("/");
      }
    }
  }
  useEffect(() => {
    checkAuth()
    const disableRightClick = (event) => {
      event.preventDefault();
    };

    // Attach the event listener to the entire document
    document.addEventListener('contextmenu', disableRightClick);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
    };
  }, []);

  return (
    <>
      <Seo pageTitle="Flight Booking Payment Confirm Page" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header10 />
      {/* End Header 1 */}

      <section className="pt-40 layout-pb-md">
        <div className="container">
          <ConfirmBooking />
        </div>
        {/* End container */}
      </section>
      {/* End stepper */}

      
      {/* End Call To Actions Section */}

      <Footer />
    </>
  );
};

export default Index;
