import SkeletonPost from "./Post/SkeletonPost";
import { FC } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { PostInterface } from "../types/PostInterface";
import Post from "./Post/Post";

type Props = {
  id: string;
};

const PostStream: FC<Props> = ({ id }) => {
  const getProfilePosts = async () => {
    try {
      const { data } = await axios.get(`/api/posts/profile/${id}`);
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  const { status, data: posts } = useQuery(
    `profile posts ${id}`,
    getProfilePosts,
    {
      enabled: !!id,
    }
  );
  return (
    <div>
      {status === "loading" && (
        <>
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
        </>
      )}
      {status === "error" && <div>Unable to retrieve posts</div>}
      {status === "success" &&
        posts &&
        posts.map((post: PostInterface) => (
          <Post key={post._id} initialData={post} />
        ))}
    </div>
  );
};

export default PostStream;
