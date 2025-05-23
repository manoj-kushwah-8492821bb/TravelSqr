import Social from "../../common/social/Social";
import Link from "next/link";
const Copyright = () => {
  return (
    <div className="row justify-between items-center y-gap-10">
      <div className="col-auto">
        <div className="row x-gap-30 y-gap-10">
          <div className="col-auto">
            <div className="d-flex items-center">
              © {new Date().getFullYear()} by&nbsp;
              <Link
                href="#"
                className="text-16 text-blue-1 fw-500"
              >
                Travel Square
              </Link>
              &nbsp;All rights reserved.
            </div>
          </div>
          {/* End .col */}
          {/* <div className="col-auto">
            <div className="d-flex x-gap-15">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Site Map</a>
            </div>
          </div> */}
          {/* End .col */}
        </div>
        {/* End .row */}
      </div>
      {/* End .col */}
{/* 
      <div className="col-auto">
        <div className="row y-gap-10 items-center">
          <div className="col-auto">
            <div className="d-flex items-center">
              <button className="d-flex items-center text-14 fw-500 text-dark mr-10">
                <i className="icon-globe text-16 mr-10" />
                <span className="underline">English (US)</span>
              </button>
              <button className="d-flex items-center text-14 fw-500 text-dark mr-10">
                <i className="icon-usd text-16 mr-10" />
                <span className="underline">USD</span>
              </button>
            </div>
          </div>
        </div>
      </div> */}
      {/* End .col */}
    </div>
  );
};

export default Copyright;
