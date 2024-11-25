import { Link, useNavigate } from "react-router-dom";
import { ChildrenType } from "~/types/childrenType";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import Image from "~/components/Image";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { FaUser, FaLocationDot, FaBagShopping, FaKey } from "react-icons/fa6";


function AccountLayout({ children }: ChildrenType) {
  const navigate = useNavigate()
  const userProfile = useSelector(
    (state: RootState) => state.userProfile.userProfile
  );

  useEffect(() => {
    if (!userProfile) {
      navigate('/login')
    }
  }, [userProfile, navigate])

  const [menuAccount, setMenuAccount] = useState(() => {
    // Lấy giá trị menuAccount từ sessionStorage hoặc mặc định là "account"
    return sessionStorage.getItem("menuAccount") || "account";
  });

  useEffect(() => {
    // Lưu menuAccount vào sessionStorage khi thay đổi
    sessionStorage.setItem("menuAccount", menuAccount);
  }, [menuAccount]);

  useEffect(() => {
    // Reset sessionStorage khi rời khỏi AccountLayout
    return () => {
      sessionStorage.setItem("menuAccount", "account");
    };
  }, []);

  const handleMenu = (id: string) => {
    if (menuAccount !== id) {
      setMenuAccount(id);
    }
  };

  const getClassName = (id: string) => {
    return `py-2 px-2 my-1 cursor-pointer rounded-lg transition-colors duration-200 ${menuAccount === id
      ? "bg-[#eb3e32] text-white"
      : "text-black bg-white hover:bg-[#eb3e32] hover:text-white"
      }`;
  };

  return (
    <>
      <Header />
      <section className="bg-[#f3f4f6] pt-32 px-40">
        <div className="flex justify-between ">
          <div className="sticky top-[92px] max-h-[60vh] w-2/6 py-10 px-4 bg-white rounded-lg">
            <div className="w-[180px] min-h-10 m-auto text-center flex flex-col items-center mb-10">
              <div className="w-[100px] mb-[10px]">
                <Image
                  src="https://th.bing.com/th/id/OIP.SbnxR2-F4GQCbQ8J5yXSoQAAAA?pid=ImgDet&w=177&h=177&c=7&dpr=1.3"
                  alt=""
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <p className="font-bold">{userProfile?.fullname}</p>
              </div>
            </div>
            <div className="flex flex-col px-4">
              <div className={getClassName("account")}>
                <Link to={"/account"} onClick={() => handleMenu("account")}>
                  <div className="flex items-center">
                    <FaUser className="text-lg" />
                    <span className="text-mb ml-1">Thông tin tài khoản</span>
                  </div>
                </Link>
              </div>
              <div className={getClassName("addressuser")}>
                <Link to={"/addressuser"} onClick={() => handleMenu("addressuser")}>
                  <div className="flex items-center">
                    <FaLocationDot className="text-lg" />
                    <span className="text-mb ml-1">Địa chỉ nhận hàng</span>
                  </div>
                </Link>
              </div>
              <div className={getClassName("orders")}>
                <Link to={"/orders"} onClick={() => handleMenu("orders")}>
                  <div className="flex items-center">
                    <FaBagShopping className="text-lg" />
                    <span className="text-mb ml-1">Đơn đặt hàng</span>
                  </div>
                </Link>
              </div>
              <div className={getClassName("changepassword")}>
                <Link to={"/changepassword"} onClick={() => handleMenu("changepassword")}>
                  <div className="flex items-center">
                    <FaKey className="text-lg" />
                    <span className="text-mb ml-1">Đổi mật khẩu</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full h-full px-6 py-4 ml-4 bg-white rounded-lg">
            {children}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default AccountLayout;
