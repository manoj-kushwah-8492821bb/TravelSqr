import Image from "next/image";
import Link from "next/link";
import dummyBlogs from "../../data/blogs";
import { useState, useEffect, useMemo } from "react";
import { getRequestToken } from "../../api/Api";
import { BASE_URL_IMG } from "../../config";
import toast from "react-hot-toast";

const Blog = ({ isBlogPage = false }) => {
  const [blogsData, setBlogsData] = useState([]); // Stores coupon list
  const [loader, setLoader] = useState(true); // Controls loading state
  const [pageLength, setPageLength] = useState(10); // Items per page
  const [page, setPage] = useState(1); // Current page number
  const [search, setSearch] = useState(""); // Search query input
  const [searchData, setSearchData] = useState(""); // Processed search data
  const [totalPages, setTotalPages] = useState(0); // Total number of pages

  const renderPages = (pageTotal, currentPage, numPagesToShow = 7) => {
    const totalPages = pageTotal;
    const pageNumbers = [];

    const startPage = Math.max(1, currentPage - Math.floor(numPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + numPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="row x-gap-20 y-gap-20 items-center md:d-none d-flex justify-content-between flex-nowrap">
        <div
          className={`size-40 flex-center rounded-full cursor-pointer ${
            currentPage === 1 ? "bg-dark-1 text-white" : ""
          }`}
          onClick={() => handlePageClick(1)}
        >
          |&lt;
        </div>
        {currentPage === 1 ? (
          <div
            className={`size-40 flex-center rounded-full cursor-pointer ${
              currentPage > 1 ? "bg-dark-1 text-white" : ""
            }`}
            style={{ cursor: "default", color: "grey" }}
          >
            &lt;
          </div>
        ) : (
          <div
            className={`size-40 flex-center rounded-full cursor-pointer ${
              currentPage > 1 ? "bg-dark-1 text-white" : ""
            }`}
            onClick={() => handlePageClick(currentPage - 1)}
          >
            &lt;
          </div>
        )}
        {startPage > 2 && (
          <div className="size-40 flex-center rounded-full cursor-pointer">
            ...
          </div>
        )}
        {pageNumbers.map((pageNumber) => (
          <div
            key={pageNumber}
            className={`size-40 flex-center rounded-full cursor-pointer ${
              pageNumber === currentPage ? "bg-dark-1 text-white" : ""
            }`}
            onClick={() => handlePageClick(pageNumber)}
          >
            {pageNumber}
          </div>
        ))}
        {endPage < totalPages - 1 && (
          <div className="size-40 flex-center rounded-full cursor-pointer">
            ...
          </div>
        )}
        {currentPage === totalPages ? (
          <div
            className={`size-40 flex-center rounded-full cursor-pointer ${
              currentPage < totalPages ? "bg-dark-1 text-white" : ""
            }`}
            style={{ cursor: "default", color: "grey" }}
          >
            &gt;
          </div>
        ) : (
          <div
            className={`size-40 flex-center rounded-full cursor-pointer ${
              currentPage < totalPages ? "bg-dark-1 text-white" : ""
            }`}
            onClick={() => handlePageClick(currentPage + 1)}
          >
            &gt;
          </div>
        )}
        <div
          className={`size-40 flex-center rounded-full cursor-pointer ${
            currentPage === totalPages ? "bg-dark-1 text-white" : ""
          }`}
          onClick={() => handlePageClick(totalPages)}
        >
          &gt;|
        </div>
      </div>
    );
  };

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/blog?page=${page}&limit=${pageLength}&search=${search}`,
      {},
      "get",
      localStorage.getItem("token")
    );
    console.log("Blogs_:", promiseToken);
    if (promiseToken.error) {
      setLoader(false);
      toast.error("Something went wrong. Try again later.");
    } else {
      setLoader(false);
      setBlogsData(promiseToken.response.ResponseBody.docs);
      setTotalPages(promiseToken.response.ResponseBody.totalPages);
    }
  };

  useEffect(() => {
    getData();
  }, [search, page, pageLength]);

  const changePagePerItem = (e) => {
    const newPageLength = parseInt(e.target.value, 10);
    const currentTotalItems = pageLength * (page - 1) + 1; // Calculate the current total items
    const newPage = Math.ceil(currentTotalItems / newPageLength);

    setPageLength(newPageLength);
    setPage(newPage);
  };

  // const blogList = blogsData?.length > 0 ? blogsData : dummyBlogs;
  const blogList = blogsData;

  return (
    <>
      {blogList.slice(0, 4).map((item) => (
        <div
          className="col-lg-3 col-sm-6"
          key={item._id}
          data-aos="fade"
          data-aos-delay={item.delayAnimation}
        >
          <Link href={`/blog/blog-details/${item._id}`}>
            <div className="blogCard -type-1 d-block ">
              <div className="blogCard__image">
                <div className="ratio ratio-1:1 rounded-4 rounded-8">
                  <img
                    width={400}
                    height={400}
                    className="img-ratio js-lazy"
                    src={
                      // blogsData?.length > 0
                      //   ? `${BASE_URL_IMG}server/uploads/admin/${item.image}`
                      //   :
                      // item.image
                      `${BASE_URL_IMG}server/uploads/admin/${item.image}`
                    }
                    alt="image"
                  />
                </div>
              </div>
              <div className="mt-20">
                <h4 className="text-dark-1 text-18 fw-500">{item.title}</h4>
                
              </div>
            </div>
          </Link>
        </div>
      ))}

      {/* <Pagination /> */}
      {isBlogPage && (
        <div className="border-top-light mt-30 pt-30">
          <div className="row x-gap-10 y-gap-20 justify-between md:justify-center">
            <div className="col-1">
              <select
                // onChange={(e) => {
                //   setPageLength(e.target.value);
                // }}
                onChange={changePagePerItem}
                class="form-select"
                aria-label="Default select example"
              >
                <option value={10} selected={pageLength == 10}>
                  10
                </option>
                <option value={20} selected={pageLength == 20}>
                  20
                </option>
                <option value={30} selected={pageLength == 30}>
                  30
                </option>
              </select>
            </div>
            <div className="col-1">&nbsp;</div>

            <div className="col-10 d-flex justify-content-end">
              <div className="row x-gap-20 y-gap-20 items-center md:d-none">
                {renderPages(totalPages, page)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Blog;
