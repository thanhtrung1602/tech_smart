/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// import logo from "~/assets/images/logo.png";
import { FaList } from "react-icons/fa";

import logo1 from "~/assets/images/logo2.png";
import Image from "~/components/Image";
import {
  FaArrowRight,
  FaArrowRightFromBracket,
  FaArrowRightToBracket,
  FaTicket,
} from "react-icons/fa6";
import { MdOutlineShoppingCart, MdPersonOutline } from "react-icons/md";
import { IoPerson, IoPersonAdd } from "react-icons/io5";
import MenuTooltip from "~/components/Popper/MenuTooltip";
import useGet from "~/hooks/useGet";
import Categories from "~/models/Categories";
import Manufacturer from "~/models/Manufacturer";
import { useDispatch, useSelector } from "react-redux";
import Carts from "~/models/Carts";
import { RootState } from "~/redux/store";
import {
  setActiveMenu,
  previousMenu,
  resetActiveMenu,
} from "~/redux/menuSlice";
import { removeUserProfile } from "~/redux/userProfileSlice";
import Search from "~/components/search";

function Header() {
  const [scrollShadow, setScrollShadow] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const activeMenu = useSelector((state: RootState) => state.menu.activeMenu);
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [showManufacturers, setShowManufacturers] = useState(false);

  const location = useLocation();
  const dispatch = useDispatch();
  const userProfile = useSelector(
    (state: RootState) => state.userProfile.userProfile
  );

  const cartProducts = useSelector(
    (state: RootState) => state.cart.cartProducts
  );

  const { data: categories } = useGet<Categories[]>(
    `/categories/getAllCategories`
  );

  const { data: manufacturers } = useGet<Manufacturer[]>(
    `/manufacturer/getManufacturerByCategory/${categorySlug}`,
    {
      enabled: showManufacturers && !!categorySlug,
    }
  );

  const { data: carts } = useGet<{ count: number; rows: Carts[] }>(
    `/cart/getAllCartByUserId/${userProfile?.id}`
  );

  //Responsive
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrollShadow(true);
      } else {
        setScrollShadow(false);
      }
    };

    // addEvent khi scroll
    window.addEventListener("scroll", handleScroll);

    // Clean up fn khi unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const validPaths = ["/", "/contact", "/blog", "/shop"];

  // Reset trạng thái khi đường dẫn không hợp lệ
  useEffect(() => {
    if (!validPaths.includes(location.pathname)) {
      dispatch(resetActiveMenu()); // Reset trạng thái activeMenu
    }
  }, [location.pathname, dispatch]);

  // Khôi phục trạng thái từ sessionStorage
  useEffect(() => {
    const savedMenu = sessionStorage.getItem("menuActive");
    if (savedMenu && validPaths.includes(location.pathname)) {
      dispatch(setActiveMenu(savedMenu));
    }
  }, [dispatch, location.pathname]);

  // Handler menu chính
  const handleMenu = (id: string) => {
    dispatch(setActiveMenu(id)); // Sử dụng action từ Redux

    if (id === "shop") {
      setCategorySlug(""); // Reset danh mục
      setShowOverlay(false);
    }
  };

  // Handler menu khi di chuột vào menu
  const handleMouseOver = (id: string) => {
    if (id === "shop") {
      setShowOverlay(true); // Hiển thị overlay
    }
    dispatch(setActiveMenu(id)); // Cập nhật trạng thái activeMenu tạm thời
  };

  // Handler menu khi di chuột ra menu
  const handleMouseOut = () => {
    setShowOverlay(false); // Ẩn overlay
    dispatch(previousMenu()); // Quay về menu trước
  };

  // Get class by base class
  const getClassName = (id: string) => {
    if (!validPaths.includes(location.pathname)) {
      return "text-white font-semibold cursor-pointer relative transition-color duration-500 hover:text-[#ecca36]";
    }
    return `text-white font-semibold cursor-pointer relative transition-color duration-500 ${
      activeMenu === id ? "text-[#ffdb29e7] group" : "hover:text-[#ecca36]"
    }`;
  };

  // Get class by derived class
  const getClassNameDerived = () => {
    return `fixed top-[114px] z-40 p-3 md:w-[calc(15%+100px)] bg-white transition-transform duration-300 ease-in-out origin-top ${
      showOverlay && activeMenu === "shop"
        ? "scale-y-100 opacity-100"
        : "scale-y-0 opacity-0"
    } before:fixed before:w-full before:-top-[2.5rem] before:left-0 before:h-[50px] before:w-1/4 before:bg-transparent`;
  };

  //Logout
  const handleLogout = () => {
    dispatch(removeUserProfile());
  };

  //List items action
  const LIST_ITEM = [
    {
      icon: <FaArrowRightToBracket />,
      name: "Đăng nhập",
      to: "/login",
    },
    {
      icon: <IoPersonAdd />,
      name: "Đăng ký",
      to: "/register",
    },
  ];

  //List items account
  const LIST_ITEM_ACCOUNT = [
    {
      icon: <IoPerson />,
      name: userProfile ? userProfile.fullname : "Khách",
      to: "/account",
    },
    {
      icon: <FaArrowRightFromBracket />,
      name: "Đăng xuất",
      onClick: () => {
        handleLogout();
      },
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white mb-6 transition-shadow ${
        scrollShadow ? "shadow-lg" : ""
      }`}
    >
      {/* Header with logo, navigation, and icons */}
      <div className="flex items-center justify-between px-4 py-[200px] md:px-40 md:py-[15px]">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => handleMenu("home")}
          className="flex items-center"
        >
          <Image src={logo1} alt="Logo" className="h-8 md:h-10" />
          <h2 className="text-[#eb3e32] text-xl hidden md:flex font-bold">
            TechSmart
          </h2>
        </Link>

        <Search />
        <div className="flex items-center gap-x-4 md:gap-x-6">
          <Link to="/cart" className="relative">
            <MdOutlineShoppingCart className="text-black text-2xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs py-[1px] px-2 rounded-full">
              {userProfile
                ? carts && (carts.count > 0 ? carts.count : 0)
                : cartProducts &&
                  (cartProducts.length > 0 ? cartProducts.length : 0)}
            </span>
          </Link>
          {userProfile ? (
            <MenuTooltip
              items={LIST_ITEM_ACCOUNT}
              className="flex flex-col gap-2 bg-white text-sm text-neutral-500 font-semibold rounded border-[0.5px] p-2 mt-2"
            >
              <div className="text-black text-2xl cursor-pointer">
                <MdPersonOutline />
              </div>
            </MenuTooltip>
          ) : (
            <MenuTooltip
              items={LIST_ITEM}
              className="flex flex-col gap-2 bg-white text-sm text-neutral-500 font-semibold rounded border-[0.5px] p-2 mt-2"
            >
              <div className="text-black text-2xl cursor-pointer">
                <MdPersonOutline />
              </div>
            </MenuTooltip>
          )}
        </div>
      </div>

      <div className="bg-[#eb3e32] flex justify-center items-center ">
        <div className="w-[70%]">
          <div className="flex  justify-center items-center gap-x-3 py-2 text-white">
            <div className="border-r-2">
              <div
                className={`mr-52 ${getClassName("shop")}`}
                onMouseOver={() => handleMouseOver("shop")}
                onMouseOut={handleMouseOut}
              >
                <span className="flex items-center gap-2 w-28 ">
                  <FaList className="" />
                  Danh mục
                </span>
                {/* Dropdown for categories */}
                <ul className={getClassNameDerived()}>
                  {categories?.map((category) => (
                    <li
                      key={category.id}
                      className="relative rounded hover:bg-gray-200 text-black"
                      onMouseEnter={() => {
                        setCategorySlug(category.slug);
                        setShowManufacturers(true);
                      }}
                      onMouseLeave={() => {
                        setShowManufacturers(false);
                      }}
                    >
                      <Link
                        to={`/${category.slug}`}
                        className="flex items-center gap-x-2 py-2 px-4"
                        onClick={() => handleMenu("shop")}
                      >
                        <Image
                          src={category.img}
                          fallbackSrc=""
                          alt={category.name}
                          className="size-8 object-cover"
                        />
                        <span className="text-sm font-normal">
                          {category.name}
                        </span>
                      </Link>

                      {/* Hiển thị danh sách nhà sản xuất tương ứng với category */}
                      {categorySlug === category.slug &&
                        showManufacturers &&
                        manufacturers && (
                          <ul className="fixed top-0 left-full p-3 bg-white border-l-2 h-full w-[47vw] flex flex-col flex-wrap before:fixed before:h-full before:top-0 before:-right-2 before:w-5 before:bg-transparent">
                            {manufacturers?.map((manufacturer) => (
                              <li
                                key={manufacturer.id}
                                className="hover:bg-gray-200 rounded"
                              >
                                <Link
                                  to={`/${category.slug}/${manufacturer.slug}`}
                                  className="flex text-sm py-2 px-5 font-normal"
                                  onClick={() => handleMenu("shop")}
                                >
                                  <span className="text-sm font-normal">
                                    {manufacturer.name}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="hidden md:block w-2/3">
              <ul className="flex items-center gap-x-12">
                <li className={getClassName("home")}>
                  <Link to="/" onClick={() => handleMenu("home")}>
                    Trang chủ
                  </Link>
                </li>
                <li className={getClassName("contact")}>
                  <Link to="/contact" onClick={() => handleMenu("contact")}>
                    Liên hệ
                  </Link>
                </li>
                <li className={getClassName("blog")}>
                  <Link to="/blog" onClick={() => handleMenu("blog")}>
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
