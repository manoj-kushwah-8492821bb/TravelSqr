const TestimonialRating = () => {
  return (
    <>
      <h2 className="text-30 text-white">
        What our customers are
        <br /> saying us?
      </h2>
      <p className="text-white mt-20">
      We have a large number of travelers who trust us for our high-quality services and have good memories and experiences to share with us.
      </p>

      <div className="row y-gap-30 text-white pt-60 lg:pt-40">
        {/* <div className="col-sm-5 col-6">
          <div className="text-30 lh-15 fw-600">13m+</div>
          <div className="lh-15">Happy People</div>
        </div> */}
        {/* End .col */}
<div></div>
        <div className="col-sm-5 col-6">
          <div className="text-30 lh-15 fw-600">4.88</div>
          <div className="lh-15">Overall rating</div>
          <div className="d-flex x-gap-5 items-center pt-10">
            <div className="icon-star text-white text-10" />
            <div className="icon-star text-white text-10" />
            <div className="icon-star text-white text-10" />
            <div className="icon-star text-white text-10" />
            <div className="icon-star text-white text-10" />
          </div>
        </div>
        {/* End .col */}
      </div>
    </>
  );
};

export default TestimonialRating;
