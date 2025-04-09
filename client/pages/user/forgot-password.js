import dynamic from "next/dynamic";
import CallToActions from "../../components/common/CallToActions";
import Seo from "../../components/common/Seo";
//import DefaultHeader from "../../components/header/header";
import DefaultHeader from "../../components/header/dashboard-header/index";
import ForgotPassword from "../../components/common/UserForgotPassword";
import Footer from "../../components/footer/footer";

const LogIn = () => {
  return (
    <>
      <Seo pageTitle="Forgot Password" />
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
                <ForgotPassword />
                {/* End .Login */}

                <div className="row y-gap-20 pt-30">
                  {/* <div className="col-12">
                    <div className="text-center">or sign in with</div>
                  </div> */}
                  {/* <LoginWithSocial /> */}
                </div>
                {/* End .row */}
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

export default dynamic(() => Promise.resolve(LogIn), { ssr: false });
