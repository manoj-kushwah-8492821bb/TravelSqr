import Image from "next/image";
import ReactHtmlParser, {
  processNodes,
  convertNodeToElement,
  htmlparser2,
} from "react-html-parser";

const Block1 = (props) => {
  return (
    <>
      <div className="col-lg-12">
        <h2 className="text-30 fw-600">About Travel Square</h2>
        <p className="text-dark-1 mt-60 lg:mt-40 md:mt-20">
          {ReactHtmlParser(props.data)}
        </p>
      </div>
      {/* 
      <div className="col-lg-6">
        <Image
          width={400}
          height={400}
          src="/img/pages/about/2.png"
          alt="image"
          className="rounded-4 w-100"
        />
      </div> */}
    </>
  );
};

export default Block1;
