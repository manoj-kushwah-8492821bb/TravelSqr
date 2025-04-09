import CallToActions from "../../../components/common/CallToActions";
import Seo from "../../../components/common/Seo";
import Header11 from "../../../components/header/header";
import DefaultFooter from "../../../components/footer/footer";
import StepperBooking from "../../../components/booking-page/stepper-booking";

const index = () => {
  return (
    <>
      <Seo pageTitle="Flight Booking Payment Page" />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header11 />
      {/* End Header 1 */}

      <section className="pt-40 layout-pb-md">
        <div className="container">
          <StepperBooking />
        </div>
        {/* End container */}
      </section>
      {/* End stepper */}

      
      {/* End Call To Actions Section */}

      <DefaultFooter />
    </>
  );
};

export default index;
