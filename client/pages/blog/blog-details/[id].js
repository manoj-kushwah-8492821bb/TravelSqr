import { useRouter } from "next/router";
import { BASE_URL_IMG } from "../../../config";
import Seo from "../../../components/common/Seo";
import React, { useEffect, useState } from "react";
import { getRequestToken } from "../../../api/Api";
import DefaultHeader from "../../../components/header/header";
import DefaultFooter from "../../../components/footer/footer";
import Comments from "../../../components/blog/blog-details/Comments";
import FormReply from "../../../components/blog/blog-details/FormReply";
import DetailsContent from "../../../components/blog/blog-details/DetailsContent";
import Skeleton from "react-loading-skeleton";

const BlogSingleDynamic = () => {
  const router = useRouter();
  const id = router.query.id;
  const [blog, setBlogItem] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const promiseToken = await getRequestToken(
        `admin/blog`,
        {},
        "get",
        localStorage.getItem("token")
      );

      const blogData = promiseToken.response?.ResponseBody?.docs || [];

      const selectedBlog = blogData.find((item) => item._id === id);

      if (selectedBlog) {
        setBlogItem(selectedBlog);
      } else {
        console.warn("Blog not found");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching blog:", error);
    }
  };

  useEffect(() => id && fetchBlog(), [id]);

  return (
    <>
      <Seo pageTitle="Blog" />
      <div className="header-margin"></div>
      <DefaultHeader />

      {loading ? (
        <div className="row y-gap-30 layout-pb-md layout-pt-md container mx-auto">
          <div className="col">
            <Skeleton height={"550px"} width={"100%"} />
          </div>
        </div>
      ) : (
        <section className="layout-pt-md layout-pb-md">
          <div className="container">
            <div className="row y-gap-40 justify-center text-center">
              <div className="col-auto">
                <div className="text-15 fw-500 text-blue-1 mb-8 text-capitalize">
                  {blog?.tag}
                </div>
                <h1 className="text-30 lg:text-29 md:text-25 fw-600">
                  {blog?.title}
                </h1>
              </div>

              <div className="col-12">
                <img
                  src={`${BASE_URL_IMG}server/uploads/admin/${blog.image}`}
                  alt={blog?.title}
                  className="col-12 rounded-8 w-100 "
                />
              </div>
            </div>

            <div className="row y-gap-30 justify-center">
              <div className="col-xl-8 col-lg-10 layout-pt-md">
                <DetailsContent blog={blog} />
                <h2 className="text-22 fw-500 mb-15 pt-30">Guest reviews</h2>
                <Comments blogId={blog._id} />

                <div className="border-top-light pt-40 mt-40" />

                <div className="row">
                  <div className="col-auto">
                    <h3 className="text-22 fw-500">Leave a Reply</h3>
                    <p className="text-15 text-dark-1 mt-5">
                      Your email address will not be published.
                    </p>
                  </div>
                </div>
                {/* End Leave a repy title */}

                <FormReply blogId={blog._id} />
              </div>
              {/* End .col */}
            </div>
          </div>
        </section>
      )}

      <DefaultFooter />
    </>
  );
};

export default BlogSingleDynamic;
