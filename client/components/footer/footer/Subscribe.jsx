const Subscribe = () => {
  return (
    <div className="single-field relative d-flex justify-end items-center pb-30">
      <input
        className="bg-white rounded-8"
        style={{
          border:"1px solid",
          borderRadius:'12px'
        }}
        type="email"
        placeholder="Your Email"
        required
      />
      &nbsp;
      &nbsp;
      <button

        type="submit"
        className=" text-dark-1 button -md h-60 bg-blue-1 text-white"
      >
        Subscribe
      </button>
    </div>
  );
};

export default Subscribe;
