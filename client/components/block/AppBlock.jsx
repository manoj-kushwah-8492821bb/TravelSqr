const AppBlock = () => {
  return (
    <>
      <h2
        className="display-4 fw-bold lh-tight text-md-3 text-sm-2"
        style={{ whiteSpace: "normal" }}
      >
        Experience Airline with{" "}
        <span style={{ color: "#2a50bf" }}>Travel Square</span>
      </h2>

      <p
        className="text-secondary mt-4 fs-5 fs-sm-6"
        style={{ whiteSpace: "normal" }}
      >
        Redefine Elegance in the Skies With Our Premium Airline Partner
      </p>
      <div
        className="button -outline-blue-1  mt-4 px-4  py-2 fs-5 fs-sm-6 w-25 w-sm-50 text-center"
        style={{ whiteSpace: "nowrap" }}
      >
        View Deal <div className="icon-arrow-top-right ml-15 ms-2" />
      </div>

      {/* End .row */}
    </>
  );
};

export default AppBlock;
