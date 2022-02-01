import { FC } from "react";
import { AiOutlineSearch } from "react-icons/ai";

type Props = {
  placeholder: string;
};

const SearchBar: FC<Props> = ({ placeholder }) => {
  return (
    <section className="h-full w-full  flex items-center">
      <form className="h-full w-full  hidden md:flex items-center ">
        <div />
        <label className="flex items-center focus-within:ring outline-blue-500 group rounded-full p-2 bg-zinc-200 w-full max-w-xs">
          <span
            id="search-icon"
            className="group-focus-within:opacity-0 grid place-items-center mr-1 text-gray-400 text-xl"
          >
            <AiOutlineSearch />
          </span>
          <input
            type="search"
            aria-label="search"
            placeholder={placeholder}
            className="font-roboto bg-transparent  placeholder-gray-400 w-full outline-none focus:-translate-x-5 transition-all"
          />
        </label>
      </form>
    </section>
  );
};

export default SearchBar;
