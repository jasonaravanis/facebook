import WhiteBox from "../../components/common/WhiteBox";
import PostStream from "../../components/PostStream";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import { PostInterface } from "../../types/PostInterface";
import { useReducer } from "react";
import Modal from "../../components/Modal";
import Post from "../../components/Post/Post";
import FriendGrid from "../../components/FriendGrid";

const ForeignPosts = () => {
  const { uid } = useParams();
  const getImagePosts = async (imageLimit: number) => {
    try {
      const { data } = await axios.get(`/api/posts/getImagePosts/${uid}`, {
        params: { limit: imageLimit },
      });
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  const imageLimit = 9; // 0 means there is no image limit

  const { data: imagePosts } = useQuery(
    [`imagePosts ${uid}`, imageLimit],
    () => getImagePosts(imageLimit),
    {
      enabled: !!uid,
    }
  );

  const initialModalState = { open: false, data: null };

  type ACTIONTYPE =
    | { type: "open"; payload: { pid: string } }
    | { type: "close"; payload: null };

  const modalReducer = (
    state: typeof initialModalState,
    action: ACTIONTYPE
  ) => {
    switch (action.type) {
      case "open":
        const post = imagePosts.find(
          (element: PostInterface) => element._id === action.payload.pid
        );
        return { open: true, data: post };
      case "close":
        return { open: false, data: null };
    }
  };

  const [modal, modalDispatch] = useReducer(modalReducer, initialModalState);

  if (!uid) {
    return <div>Something Went Wrong...</div>;
  } else
    return (
      <>
        <div className=" col-span-2 hidden md:flex flex-col justify-end">
          <div className="space-y-3 sticky bottom-3 flex flex-col">
            <WhiteBox>
              <div className=" flex justify-between items-baseline">
                <h2 className=" text-zinc-800 font-medium text-lg mb-2">
                  Photos
                </h2>
                <Link to="photos" className=" text-facebook-blue text-sm">
                  See All Photos
                </Link>
              </div>

              <ul className="grid grid-cols-3 grid-rows-3 gap-2 aspect-square">
                {imagePosts &&
                  imagePosts.map((post: PostInterface) => (
                    <li key={post._id}>
                      <button
                        className="w-full h-full flex justify-center items-center border border-zinc-300 rounded-md p-1 shadow-sm transition-all hover:scale-105"
                        onClick={(e) => {
                          e.preventDefault();
                          modalDispatch({
                            type: "open",
                            payload: { pid: post._id },
                          });
                        }}
                      >
                        <img
                          src={`/api/images/${post.image}`}
                          alt="user uploaded"
                          className="= max-w-full max-h-full"
                        />
                      </button>
                    </li>
                  ))}
              </ul>
            </WhiteBox>
            <FriendGrid id={uid} />
          </div>
        </div>
        <div className="  col-span-5 md:col-span-3">
          <PostStream id={uid} />
        </div>
        {modal.open && (
          <Modal
            open={modal.open}
            onClose={() => {
              modalDispatch({ type: "close", payload: null });
            }}
          >
            <Post initialData={modal.data} />
          </Modal>
        )}
      </>
    );
};

export default ForeignPosts;
