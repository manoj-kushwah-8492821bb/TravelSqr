import Seo from "../../components/common/Seo";
import Header10 from "../../components/header/header";
import Footer from "../../components/footer/footer";
import StepperBooking from "../../components/booking-page/stepper-booking";

const index = () => {
  return (
    <>
      <Seo pageTitle="Flight Booking Payment Page" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header10 />
      {/* End Header 1 */}

      <section className="pt-40 layout-pb-md">
        <div className="container">
          <StepperBooking />
        </div>
        {/* End container */}
      </section>
      {/* End stepper */}

      
      {/* End Call To Actions Section */}

      <Footer />
    </>
  );
};

export default index;
