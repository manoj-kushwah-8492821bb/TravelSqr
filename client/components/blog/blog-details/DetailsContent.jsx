const DetailsContent = ({ blog }) => {
  return (
    <>
      <h3 className="text-20 fw-500">{blog.title}</h3>
      <div className="text-15 mt-20">{blog.introduction}</div>

      {blog.tips && (
        <ul className="list-disc text-15 mt-30">
          {blog.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      )}

      {blog.destinations && (
        <ul className="list-disc text-15 mt-30">
          {blog.destinations.map((destination, index) => (
            <li key={index}>{destination}</li>
          ))}
        </ul>
      )}

      {blog.keywords && (
        <div className="mt-30">
          <strong>Keywords: </strong>
          <span className="text-15">{blog.keywords.join(", ")}</span>
        </div>
      )}

      <div className="quote mt-30 mb-30">
        <div className="quote__line bg-blue-1" />
        <div className="quote__icon">
          <img
            src="/img/misc/quote.svg"
            alt="icon"
            style={{ maxWidth: "40%" }}
          />
        </div>
        <div className="text-18 fw-500">“{blog.conclusion}“</div>
      </div>
    </>
  );
};

export default DetailsContent;
