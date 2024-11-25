import { memo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import Tippy from "@tippyjs/react/headless";
import useSearch from "~/hooks/useSearch";
import useDebounce from "~/hooks/useDebounce";
import { Link } from "react-router-dom";
import ResultSearch from "./resultSearch";

type SearchProduct = {
  _id: number;
  _source: {
    img: string;
    name: string;
    price: number;
    slug: string;
  };
};

function Search() {
  const [key, setKey] = useState<string>("");
  const [hiddenSearch, setHiddenSearch] = useState<boolean>(false);
  const inputSearchDebounce = useDebounce(key, 300);
  const { data: products, isLoading } = useSearch<SearchProduct[]>(
    "/products/search",
    inputSearchDebounce
  );

  return (
    <Tippy
      interactive
      visible={true}
      placement="bottom-end"
      onClickOutside={() => setHiddenSearch(false)}
      render={(attrs) => (
        <div className="w-[36rem] mt-2" tabIndex={-1} {...attrs}>
          <div className="rounded-lg bg-white shadow-lg">
            {hiddenSearch && (
              <ul>
                <li className="p-3 border-b text-gray-600">
                  Tìm kiếm cho "{key}"
                </li>

                {isLoading && (
                  <li className="p-4 text-center text-gray-500">
                    <div className="inline-block animate-spin w-6 h-6 border-2 border-[#eb3e32] border-t-transparent rounded-full" />
                    <p className="mt-2">Đang tìm kiếm...</p>
                  </li>
                )}

                {!isLoading && products && products.length > 0 && (
                  <>
                    <li className="p-3 text-gray-600">Sản phẩm đề xuất</li>
                    {products.map((product) => (
                      <li key={product._id} className="">
                        <Link to={""} className="block p-3">
                          <ResultSearch
                            id={product._id}
                            name={product._source.name}
                            image={product._source.img}
                            price={product._source.price}
                            slug={product._source.slug}
                          />
                        </Link>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    >
      <form className="relative hidden md:block">
        <input
          type="search"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setHiddenSearch(true);
          }}
          placeholder="Hôm nay bạn muốn tìm kiếm gì?"
          className="w-[36rem] h-11 rounded-full pl-5 pr-12 bg-white 
                 border border-[#eb3e32] outline-none focus:border-[#d32f2f]"
        />
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#eb3e32] hover:text-[#d32f2f]"
          type="submit"
        >
          <FaSearch className="w-5 h-5" />
        </button>
      </form>
    </Tippy>
  );
}

export default memo(Search);
