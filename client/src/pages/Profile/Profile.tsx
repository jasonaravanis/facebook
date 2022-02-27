import { FC, useContext, useState } from "react";
import { AuthContext } from "../../contexts/Auth";
import UserThumbnail from "../../components/common/UserThumbnail";
import { RiPencilFill } from "react-icons/ri";
import Tab from "../../components/common/Tab";
import SecondaryButton from "../../components/common/SecondaryButton";
import { Outlet, useParams, useOutletContext } from "react-router-dom";
import Modal from "../../components/Modal";
import EditProfile from "./EditProfile";
import { User } from "../../types/User";

type ContextType = { user: User | null };

export function useUser() {
  return useOutletContext<ContextType>();
}

const Profile = () => {
  const { user, getUserState } = useContext(AuthContext);
  const [editProfileModal, setEditProfileModal] = useState(false);

  return (
    <div className="  min-h-screen relative -top-5">
      <div className=" bg-zinc-100 pt-10 flex justify-center shadow-md">
        <header className=" w-full md:w-[60vw] ">
          <div className="w-full flex items-center border-b border-zinc-300 pb-3  px-2 md:px-0">
            <div className=" h-20 md:h-36">
              <UserThumbnail />
            </div>
            <div className=" flex justify-between items-end ml-4 translate-y-3 w-full">
              <div>
                <h1 className=" text-4xl font-medium text-zinc-800">
                  {user?.fullName}
                </h1>
                <span className=" text-zinc-500">
                  {(() => {
                    const length = user?.friends.length;
                    return `${length} ${length === 1 ? "friend" : "friends"}`;
                  })()}
                </span>
              </div>

              <SecondaryButton onClick={() => setEditProfileModal(true)}>
                <RiPencilFill className=" text-zinc-700 m-1 text-lg" />
                <span className=" ">Edit Profile</span>
              </SecondaryButton>
            </div>
          </div>
          <nav>
            <ul className="flex">
              <Tab end={true} title="Posts" to={`/${user!._id}`} />
              <Tab end={false} title="Friends" to="friends" />
              <Tab title="Photos" to="photos" />
            </ul>
          </nav>
        </header>
      </div>
      <main className=" flex justify-center flex-grow mt-3">
        <Modal
          open={editProfileModal}
          onClose={() => {
            getUserState();
            setEditProfileModal(false);
          }}
          title="Edit Profile"
        >
          <EditProfile />
        </Modal>
        <div className="grid grid-cols-5 w-full md:w-[60vw] gap-3">
          <Outlet context={{ user: user }} />
        </div>
      </main>
    </div>
  );
};

export default Profile;
