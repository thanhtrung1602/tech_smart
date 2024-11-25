/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import usePost from "~/hooks/usePost";
import loginImage from "~/assets/images/loginImage.png";
import Image from "~/components/Image";
import { useDispatch, useSelector } from "react-redux";
import Carts from "~/models/Carts";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import LoginData from "~/types/dataLogin";
import { removeCart } from "~/redux/cartSlice";
import { setAccessToken, setRefreshToken } from "~/redux/cookieSlice";
import { setUserProfile } from "~/redux/userProfileSlice";
import { RootState } from "~/redux/store";

function Login() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginData>();
  //Mình sài cái handle có sẵn của nó luôn, đr
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login } = usePost();
  const { mutate: createCart } = usePost();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userProfile = useSelector(
    (state: RootState) => state.userProfile.userProfile
  );

  const onSubmit = (data: LoginData) => {
    login(
      { url: "/auth/login", data },
      {
        onSuccess: (response) => {
          if (response.status === 200) {
            if (response.data.users.role === "admin") {
              return toast.error("Tài khoản đã có vai trò khác");
            } else {
              dispatch(setAccessToken(response.data.accessToken));
              dispatch(setRefreshToken(response.data.refreshToken));
              dispatch(setUserProfile(response.data.users));

              //Lấy tempCart nếu có
              const guestCartProducts = localStorage.getItem("tempCart");

              //Nếu tempCart và user có tồn tại thì lặp qua tempCart để tạo cart mới có id của user
              if (guestCartProducts) {
                const updatedCart = JSON.parse(guestCartProducts).map(
                  (product: Carts) => {
                    const dataTempCart = {
                      userId: response.data.users.id,
                      productId: product.id,
                      quantity: product.quantity,
                      color: product.color,
                      rom: product.rom,
                      total: product.price,
                    };

                    return createCart(
                      {
                        url: "cart/createCart",
                        data: dataTempCart,
                      },
                      {
                        onSuccess: (res) => {
                          if (res.status === 200) {
                            console.log("Cart created successfully: ", res);
                          }
                        },
                        onError: (error) => {
                          console.log("Error creating cart:", error);
                        },
                      }
                    );
                  }
                );

                try {
                  const promise = Promise.all(updatedCart);
                  console.log("Cart created successfully: ", promise);
                  dispatch(removeCart());
                } catch (error) {
                  console.error("Error creating cart:", error);
                }
              }
              toast.success("Đăng nhập thành công!");
              // navigate("/");
              window.location.href = "/";
            }
          }
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            console.log(error);
            const backendErrors = error.response?.data.errors;
            if (backendErrors) {
              // Loop through each error from the backend
              Object.entries(backendErrors).forEach(([field, message]) => {
                setError(field as keyof LoginData, {
                  type: "server",
                  message: String(message),
                });
              });
            }
          } else {
            console.error("Lỗi không xác định:", error);
          }
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-r from-gray-200 via-white to-gray-200 h-auto py-12">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="pb-6 text-black text-3xl font-bold text-center">
          Đăng nhập
        </h1>
        <p className="pb-8 text-black text-center">
          Bạn chưa có tài khoản?{" "}
          <Link
            to={"/register"}
            className="font-semibold text-main500 hover:text-red-600"
          >
            Đăng ký
          </Link>
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="pb-6">
            <input
              {...register("phone", { required: "Số điện thoại bắt buộc" })}
              type="text"
              placeholder="Số điện thoại"
              className="bg-gray-100 text-black w-full rounded-md px-4 py-2 outline-none focus:ring-1 focus:ring-gray-200"
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
          <div className="relative pb-6">
            <input
              {...register("password", { required: "Mật khẩu bắt buộc" })}
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              className="bg-gray-100 text-black w-full rounded-md px-4 py-2 outline-none focus:ring-1 focus:ring-gray-200"
            />
            {showPassword ? (
              <FaEye
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-5 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              />
            ) : (
              <FaEyeSlash
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-5 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              />
            )}
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="py-6 flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <input
                type="checkbox"
                id="checkBox"
                className="size-5 text-white accent-red-500"
              />
              <label htmlFor="checkBox" className="text-black">
                Ghi nhớ mật khẩu
              </label>
            </div>
            <Link
              to={"/forgotpass"}
              className="font-semibold text-main500 hover:text-red-600"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white rounded-md bg-red-500 hover:bg-red-600 transition-colors duration-300"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
