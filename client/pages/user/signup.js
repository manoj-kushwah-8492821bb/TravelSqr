import dynamic from "next/dynamic";
import CallToActions from "../../components/common/CallToActions";
import Seo from "../../components/common/Seo";
import DefaultHeader from "../../components/header/header";
import DefaultFooter from "../../components/footer/footer";
import LoginWithSocial from "../../components/common/LoginWithSocial";
import SignUpForm from "../../components/common/UserSignUpForm";
import Footer from "../../components/footer/footer";
import { useRouter } from "next/router";

const SignUp = () => {
  const router = useRouter();
  console.log(router?.query?.route);
  return (
    <>
      <Seo pageTitle="Sign Up" />
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
                <SignUpForm />
                {/* End SignUP */}
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

export default dynamic(() => Promise.resolve(SignUp), { ssr: false });
