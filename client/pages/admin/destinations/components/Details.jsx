import { useState } from "react";
import ReactHtmlParser, {
  processNodes,
  convertNodeToElement,
  htmlparser2,
} from "react-html-parser";
import { BASE_URL_IMG } from "../../../../config";
import Link from "next/link";
import { useEffect } from "react";
import { requestToken } from "../../../../api/Api";
import { Spinner } from "reactstrap";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const Details = (props) => {
  const [desc, setDesc] = useState(false);
  const [nearCity, setNearCity] = useState([]);
  const [genralNew, setGenralNew] = useState({});
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState({name:'',symbol:''});
  const [timeZone, setTimeZone] = useState({id:'',name:''});
  const [languages, setLanguages] = useState('');
  const [flag, setFlag] = useState('');

  const getNearCity = async () => {
    setLoading(true);
    const data = { destination_id: props?.viewData?._id };
    const promise = await requestToken(
      "admin/destination/details",
      data,
      "post",
      localStorage.getItem("token")
    );

    if (promise.error) {
      toast.error("Something went wrong. Please try again");
      setLoading(false);
    } else {
      setNearCity(promise.response.ResponseBody.nearestCities);
      setGenralNew(promise.response.ResponseBody.genralNew);
      for (const key in promise?.response?.ResponseBody?.genralNew?.currencies) {
        setCurrency({...currency,name:promise?.response?.ResponseBody?.genralNew?.currencies?.[key]?.name,symbol:promise?.response?.ResponseBody?.genralNew?.currencies?.[key]?.symbol});
      }
      for (const keyL in promise?.response?.ResponseBody?.genralNew?.languages) {
        setLanguages(promise?.response?.ResponseBody?.genralNew?.languages?.[keyL]);
      }
      setFlag(promise?.response?.ResponseBody?.genralNew?.flags.png);
      setLoading(false);
    }
  };
  useEffect(() => {
    getNearCity();
  }, []);
  return (
    <>
      <div className="row pb-3">
        <div className="col-md-2">
          <div className="profile-head">
            <h6>Name</h6>
            <h6>Status</h6>
            <h6>Title</h6>
          </div>
        </div>
        <div className="col-md-4">
          <div className="profile-head">
            <h6>{props?.viewData?.name}</h6>
            <h6>{props?.viewData?.status == 1 ? "Active" : "Inactive"}</h6>
            <h6>{props?.viewData?.title}</h6>
          </div>
        </div>
        <div className="col-md-2">
          <div className="profile-head">
            <h6>Currency</h6>
            <h6>Languages</h6>
            <h6>Flag</h6>
          </div>
        </div>
        <div className="col-md-4">
          <div className="profile-head">
            <h6>{`${currency.name} ( ${currency.symbol} )`}</h6>
            <h6>{languages}</h6>
            <h6>{flag==''?<Skeleton height={'55px'} width={'80px'} />:<img src={flag} width={80} height={30} alt="flag" />}</h6>
          </div>
        </div>
      </div>
      <div className="row pb-3">
        <div className="col-md-2">
          <div className="profile-head">
            <h6>Description</h6>
          </div>
        </div>
      </div>
      <div className="row pb-3">
        <div className="col-md-10">
          <div className="profile-head">
            <h6>
              {!desc ? (
                <>
                  {ReactHtmlParser(props?.viewData?.description.slice(0, 100))}
                  <button
                    style={{ color: "blue" }}
                    onClick={() => setDesc(true)}
                  >
                    Read More
                  </button>
                </>
              ) : (
                <>
                  {ReactHtmlParser(props?.viewData?.description)}
                  &nbsp;
                  <button
                    style={{ color: "blue" }}
                    onClick={() => setDesc(false)}
                  >
                    Read Less
                  </button>
                </>
              )}
            </h6>
          </div>
        </div>
      </div>
      <hr style={{ margin: "10px 0" }} />
      <div className="row pb-3">
        <div className="col">
          <h5>Destination Images</h5>
        </div>
      </div>
      <div className="row pb-3">
        {props?.viewData?.images?.map((item, index) => (
          <div className="div-img col-md-3 mb-3" key={index}>
            <img
              style={{ width: "400px", height: "300px" }}
              src={`${BASE_URL_IMG}${item}`}
              alt="Destination Image"
              height="180px"
              width="100%"
              onMouseOver={(e) => {}}
              className="enlarge"
            />
          </div>
        ))}
      </div>
      <hr style={{ margin: "10px 0" }} />
      <div className="row pb-3">
        <div className="col">
          <h5>Top sights in {props?.viewData?.name}</h5>
        </div>
      </div>
      <div className="row y-gap-30 pt-30">
        {props?.viewData?.topSights?.map((item) => (
          <div className="col-lg-4 col-sm-6" key={item?._id}>
            {/* <Link
              href={`/blog/blog-details/${item?._id}`}
              className="blogCard -type-1 d-block "
            > */}
            <div className="blogCard__image">
              <div className="rounded-8">
                <img
                  style={{ width: "400px", height: "300px" }}
                  width={400}
                  height={300}
                  className="cover w-100 img-fluid"
                  src={item?.images[0]}
                  alt="image"
                />
              </div>
            </div>
            <div className="pt-20">
              <h4 className="text-dark-1 text-18 fw-500">{item?.name}</h4>
            </div>
            {/* </Link> */}
          </div>
        ))}
      </div>
      <hr style={{ margin: "10px 0" }} />
      <div className="row pb-3">
        <div className="col">
          <h5>Nearest Cities from {props?.viewData?.name}</h5>
        </div>
      </div>
      <div className="row y-gap-30 pt-30">
        {loading ? (
          <Spinner color="primary"></Spinner>
        ) : (
          nearCity.map((item) => (
            <div className="col-lg-4 col-sm-6" key={item?._id}>
              {/* <Link
              href={`/blog/blog-details/${item?._id}`}
              className="blogCard -type-1 d-block "
            > */}
              <div className="blogCard__image">
                <div className="rounded-8">
                  <img
                    style={{ width: "400px", height: "300px" }}
                    width={400}
                    height={300}
                    className="cover w-100 img-fluid"
                    src={`${BASE_URL_IMG}${item?.images[0]}`}
                    alt="image"
                  />
                </div>
              </div>
              <div className="pt-20">
                <h4 className="text-dark-1 text-18 fw-500">{item?.name}</h4>
                <div className="text-light-1 text-15 lh-14 mt-5">
                  {item?.distance.toFixed(2)}
                </div>
              </div>
              {/* </Link> */}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Details;
