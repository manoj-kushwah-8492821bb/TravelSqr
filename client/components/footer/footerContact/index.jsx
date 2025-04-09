import AppButton from "./AppButton";
import ContactInfo from "./ContactInfo";
import Copyright from "./Copyright";
import FooterContent from "./FooterContent";
import Social from "../../common/social/Social";
import Subscribe from "./Subscribe";
import Link from "next/link";
import Image from "next/image";

const index = () => {
  return (
    // <footer className="footer -type-2 bg-dark-3 text-white">
    <footer className="footer -type-2 bg-light-2">
      <div className="container">
        <div className="pt-60 pb-60">
          <div className="row y-gap-40 justify-between xl:justify-start">
            <div className="col-xl-4 col-lg-6">
              <Link href="/" className="header-logo mr-50">
                <Image src="/img/general/Logo.png" alt="logo icon" height={36} width={140}/>
                {/* <img src="/img/general/Logo.png" width={140} height={36} alt="image" /> */}
              </Link>
              <div className="row y-gap-30 justify-between pt-30">
                <FooterContent />
              </div>
            </div>
            {/* End .col */}

            <div className="col-lg-6">
              <div className="row y-gap-30 lower">
                <div className="col-12">
                  {/* <h5 className="text-16 fw-500 mb-15">
                    Get Updates &amp; More
                  </h5> */}
                  <Subscribe />
                </div>
                {/* End .col */}

                {/* <FooterContent /> */}
              </div>
              {/* End .row */}
            </div>
            {/* End .col */}
          </div>
          {/* End .row */}
        </div>
        {/* End footer top */}

        <div className="py-20 border-top-white-15">
          <Copyright />
        </div>
        {/* End footer-copyright */}
      </div>
      {/* End container */}
    </footer>
  );
};

export default index;
