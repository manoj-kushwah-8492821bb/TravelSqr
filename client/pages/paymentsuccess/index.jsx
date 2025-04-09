import Seo from "../../components/common/Seo";
import Header10 from "../../components/header/header";
import Footer from "../../components/footer/footer";
import SuccessmBooking from "../../components/booking-page/SuccessBooking";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

const Index = () => {
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem('data')
    if(localStorage.getItem('success')===null){
      localStorage.setItem('success',true)
    }else{
      localStorage.removeItem('success')
      router.push("/");
    }
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
      <Seo pageTitle="Flight Booking Payment Success Page" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header10 />
      {/* End Header 1 */}

      <section className="pt-40 layout-pb-md">
        <div className="container">
          <SuccessmBooking />
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
