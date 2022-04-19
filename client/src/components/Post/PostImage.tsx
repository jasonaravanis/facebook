import React, { FC } from "react";
import { useQuery } from "react-query";
import axios from "axios";

interface Props {
  image: string;
  postID: string;
}

const PostImage: FC<Props> = ({ postID, image }) => {
  const fetchImage = async () => {
    const result = await axios.get(`/api/images/${image}`, {
      responseType: "blob",
    });
    console.log(result);
    return URL.createObjectURL(result.data);
  };

  const { isLoading, isError, isSuccess, data } = useQuery(
    `postImage: ${postID}`,
    fetchImage
  );

  if (isLoading) {
    return <div>LOADING</div>;
  }
  if (isError) {
    return <div>ERROR</div>;
  }
  if (isSuccess) {
    return <img src={data} alt="test post" className="w-full" />;
  }

  return null;
};

export default PostImage;
