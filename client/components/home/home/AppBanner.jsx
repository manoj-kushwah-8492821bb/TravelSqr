import AppBlock from "../../block/AppBlock";
import Image from 'next/image';

const AppBanner = () => {
  return (
    <section
      className="section-bg pt-90 pb-80 md:pt-40 md:pb-40 animated"
      data-aos="fade-up"
    >
      <div className="items-center container mx-auto w-full rounded-4 bg-blue-2 flex">
        <div className="row flex items-center justify-between w-full h-full">
          <div className="col-xl-5 col-lg-6 h-full flex items-center">
            <div className="p-5" style={{ width: "130%" }}>
              <AppBlock />
            </div>
          </div>

          {/* Image section will be hidden on small screens and shown on medium and above screens */}
          <div className="col-lg-5 h-full p-0 hidden md:block">
            <Image
              src="/img/masthead/1/1.png"
              alt="image"
              className="w-full h-full object-cover"
              style={{
                borderTopLeftRadius: "700px",
                borderBottomLeftRadius: "700px",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppBanner;
