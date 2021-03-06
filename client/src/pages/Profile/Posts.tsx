import WhiteBox from "../../components/common/WhiteBox";
import SecondaryButton from "../../components/common/SecondaryButton";
import PostStream from "../../components/PostStream";
import PostPrompt from "../../components/PostPrompt";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import { PostInterface } from "../../types/PostInterface";
import { useReducer, useContext } from "react";
import Modal from "../../components/Modal";
import Post from "../../components/Post/Post";
import { AuthContext } from "../../contexts/Auth";
import FriendGrid from "../../components/FriendGrid";
import { useState } from "react";
import PrimaryButton from "../../components/PrimaryButton";
import BioModal from "../../components/BioModal";

const Posts = () => {
  const { user } = useContext(AuthContext);
  const getImagePosts = async (imageLimit: number) => {
    try {
      const { data } = await axios.get(
        `/api/posts/getImagePosts/${user?._id}`,
        {
          params: { limit: imageLimit },
        }
      );
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  const imageLimit = 9; // 0 means there is no image limit

  const { data: imagePosts } = useQuery(
    [`imagePosts ${user?._id}`, imageLimit],
    () => getImagePosts(imageLimit),
    {
      enabled: !!user?._id,
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
  const [bioModal, setBioModal] = useState(false);

  if (!user?._id) {
    return <div>Something Went Wrong...</div>;
  } else
    return (
      <>
        <div className=" col-span-2 hidden md:flex flex-col justify-end">
          <div className="space-y-3 sticky bottom-3 flex flex-col">
            <WhiteBox>
              {user.bio ? (
                <>
                  <div className="flex justify-between">
                    <h2 className=" text-zinc-800 font-medium text-lg mb-2">
                      Intro
                    </h2>
                    <button
                      onClick={() => setBioModal(true)}
                      className=" text-facebook-blue text-sm m-0 p-0"
                    >
                      Edit bio
                    </button>
                  </div>
                  <span>{user.bio}</span>
                </>
              ) : (
                <>
                  <h2 className=" text-zinc-800 font-medium text-lg mb-2">
                    Intro
                  </h2>
                  <div className=" space-y-3">
                    <SecondaryButton
                      className="w-full"
                      onClick={() => setBioModal(true)}
                    >
                      <span>Add Bio</span>
                    </SecondaryButton>
                  </div>
                </>
              )}
            </WhiteBox>
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
                        className=" aspect-square overflow-hidden w-full h-full flex justify-center items-center border border-zinc-300 rounded-md p-1 shadow-sm transition-all hover:scale-105"
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
            <FriendGrid id={user._id} />
          </div>
        </div>
        <div className="  col-span-5 md:col-span-3">
          <PostPrompt />
          <PostStream id={user._id} />
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
        {bioModal && (
          <BioModal
            open={bioModal}
            onClose={() => setBioModal(false)}
            user={user}
          />
        )}
      </>
    );
};

export default Posts;
