import { FC } from "react";
import { Link } from "react-router-dom";

const Home: FC = () => {
  return (
    <div>
      <div>This is the home page</div>
      <Link to="/profile">Profile</Link>
    </div>
  );
};

export default Home;
