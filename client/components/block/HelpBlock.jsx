import Image from "next/image";
import Link from "next/link";

const HelpBlock = () => {
  const helpBlockContent = [
    {
      id: 1,
      icon: "/img/pages/help/icons/1.svg",
      title: "Booking Details",
      text: `Get answers to all your booking-related issues.`,
      link: "/user/db-booking",
    },
    {
      id: 2,
      icon: "/img/pages/help/icons/2.svg",
      title: "Payment & Receipts",
      text: `A quick guide to payment-related issues.`,
      link: "/",
    },
    {
      id: 3,
      icon: "/img/pages/help/icons/3.svg",
      title: "Booking Changes & Refunds",
      text: `Get support on questions about modifications & refunds.`,
      link: "/gen-terms",
    },
  ];
  return (
    <>
      {helpBlockContent.map((item) => (
        <div className="col-lg-4 col-md-6" key={item.id}>
          <Link href={item.link} passHref>
            <div className="bg-blue-1-05 rounded-4 px-20 py-40">
              <div className="size-70 bg-white rounded-full flex-center">
                <Image width={30} height={30} src={item.icon} alt="icon" />
              </div>
              <div className="mt-24">
                <div className="text-18 fw-500">{item.title}</div>
                <p className="mt-5" style={{ fontSize: "15px" }}>
                  {item.text}
                </p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
};

export default HelpBlock;
