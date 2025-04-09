const data = [
  {
    title: "Bokings",
    amount: "33,800",
    description: "Total Bookings",
    icon: "/img/dashboard/icons/1.svg",
  },
  {
    title: "Spends",
    amount: "14,200",
    description: "Total Spends",
    icon: "/img/dashboard/icons/2.svg",
  },
  
];

const DashboardCard = () => {
  return (
    <div className="row y-gap-30">
      {data.map((item, index) => (
        <div key={index} className="col-xl-3 col-lg-6 col-md-6">
          <div className="py-30 px-30 rounded-4 bg-white shadow-3">
            <div className="row y-gap-20 justify-between items-center">
              <div className="col-auto">
                <div className="fw-500 lh-14">{item.title}</div>
                <div className="text-26 lh-16 fw-600 mt-5">{item.amount}</div>
                <div className="text-15 lh-14 text-light-1 mt-5">
                  {item.description}
                </div>
              </div>
              <div className="col-auto">
                <img src={item.icon} alt="icon" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCard;
