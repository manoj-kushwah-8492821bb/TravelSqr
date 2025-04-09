import AppButton from "./AppButton";
import ContactInfo from "./ContactInfo";
import Copyright from "./Copyright";
import FooterContent from "./FooterContent";
import Social from "../../common/social/Social";
import Subscribe from "./Subscribe";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import React from "react";
import { toast } from "react-hot-toast";
import { Spinner } from "reactstrap";
import { BASE_URL } from "../../../config";

const Index = () => {
  const [contactData, setContactData] = React.useState({});

  const [isLoading, setIsLoading] = React.useState(true);

  const contactInfo = async () => {
    setIsLoading(true);
    try {
      const contact = await axios.get(
        BASE_URL + "flight/contact",
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (contact?.data?.succeeded === true) {
        setContactData(contact?.data?.ResponseBody);
        setIsLoading(false);
      } else {
        toast.error(contact?.data?.ResponseMessage);
      }
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    contactInfo();
  }, []);

  return (
    // <footer className="footer -type-2 bg-dark-3 text-white">
    <footer className="footer -type-2 " style={{ backgroundColor: "#051036" }}>
      {/* {isLoading ? (
        <div
          style={{
            marginTop: "15px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Spinner
            color="primary"
            style={{
              height: "3rem",
              width: "3rem",
            }}
            type="grow"
          >
            Loading...
          </Spinner>
        </div>
      ) : ( */}
      <div className="container">
        <div className="pt-60 pb-60">
          <div className="row y-gap-40 justify-between xl:justify-start">
            <div className="col-xl-4 col-lg-6">
              <Link href="/" className="w-50">
                <img src="/img/general/2logo.png" alt="logo icon" width={160} height={40} />
                {/* <img src="/img/general/Logo.png" width={140} height={36} alt="image" /> */}
              </Link>
              <div
                className="row y-gap-30 justify-between"
                style={{ color: "white" }}
              >
                {/* <ContactInfo /> */}
                <div className="col-sm-6">
                  <div className={"text-14 mt-30"}>Toll Free Customer Care</div>
                  <a
                    href={`tel:${contactData?.number}`}
                    className="text-18 fw-500 mt-5"
                  >
                    {contactData?.number}
                  </a>
                </div>
                <div className="col-sm-6">
                  <div className={"text-14 mt-30"}>Write to us</div>
                  <a
                    href={`mailto:${contactData?.email}`}
                    className="text-18 fw-500 mt-5"
                  >
                    {contactData?.email}
                  </a>
                </div>
              </div>
              {/* End .row */}

             

              {/* <div className="mt-60" style={{ color: "white" }}>
                <h5 className="text-16 fw-500 mb-10">
                  Follow us on social media
                </h5>
                <div className="d-flex x-gap-20 items-center">
                  <a
                    href={contactData?.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    // key={item.id}
                  >
                    <i className="icon-facebook text-14" />
                  </a>
                  <a
                    href={contactData?.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    // key={item.id}
                  >
                    <i className="icon-twitter text-14" />
                  </a>
                  <a
                    href={contactData?.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    // key={item.id}
                  >
                    <i className="icon-instagram text-14" />
                  </a>
                  <a
                    href={contactData?.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    // key={item.id}
                  >
                    <i className="icon-linkedin text-14" />
                  </a>
                </div>
              </div> */}
            </div>
            {/* End .col */}

            <div className="col-lg-6" style={{ color: "white" }}>
              <div className="row y-gap-30">
                {/* <div className="col-12">
                    <Subscribe />
                  </div> */}
                {/* End .col */}

                <FooterContent />
              </div>
              {/* End .row */}
            </div>
            {/* End .col */}
          </div>
          {/* End .row */}
        </div>
        {/* End footer top */}

        <div className="py-20 border-top-white-15" style={{ color: "white" }}>
          <Copyright />
        </div>
        {/* End footer-copyright */}
      </div>
      {/* )} */}

      {/* End container */}
    </footer>
  );
};

export default Index;
