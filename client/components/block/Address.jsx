const Address = (props) => {
  // const addressContent = [
  //   {
  //     id: 1,
  //     colClass: "col-lg-3",
  //     title: "Address",
  //     content: (
  //       <>*** Test Street, Tetsing Please ignore..., USA.</>
  //     ),
  //   },
  //   {
  //     id: 2,
  //     colClass: "col-auto",
  //     title: "Toll Free Customer Care",
  //     content: (
  //       <>
  //         <a href="tel:+4733378901">+** *** ** ***</a>
  //       </>
  //     ),
  //   },
  //   {
  //     id: 3,
  //     colClass: "col-auto",
  //     title: "Need live support?",
  //     content: (
  //       <>
  //         {" "}
  //         <a href="mailto:i@gotrip.com">hi@test.com</a> 
  //       </>
  //     ),
  //   },
  // ];
  return (
    <>
      {/* {addressContent.map((item) => (
        <div className={`${item.colClass}`} key={item.id}>
          <div className="text-14 text-light-1">{item.title}</div>
          <div className="text-18 fw-500 mt-10">{item.content}</div>
        </div>
      ))} */}
      <div className='col-lg-2'>
        <div className="text-15 fw-500 mt-10">{props?.contactData?.address}</div>
      </div>
      <div className='col-lg-3'>
        <div className="text-15 fw-500 mt-10">{props?.contactData?.number}</div>
      </div>
    </>
  );
};

export default Address;
