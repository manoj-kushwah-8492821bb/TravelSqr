import React from "react";
import Skeleton from "react-loading-skeleton";

const DestinationCardSkeleton = () => {
  return (
    <>
      <Skeleton height={"294px"} width={"294px"} />
      <Skeleton height={"26px"} width={"100px"} />
      <Skeleton height={"20px"} width={"294px"} />
    </>
  );
};

export default DestinationCardSkeleton;
