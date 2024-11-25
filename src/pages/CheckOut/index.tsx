/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "~/components/Image";
import NavCart from "~/layouts/components/NavCart";
import { useForm } from "react-hook-form";
import usePost from "~/hooks/usePost";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import handleBank from "~/services/bank";
import { useLocation, useNavigate } from "react-router-dom";
import OrderData from "~/types/dataOrder";
import { RootState, store } from "~/redux/store";
import useGet from "~/hooks/useGet";
import Address from "~/models/Address";
import toast from "react-hot-toast";
import Carts from "~/models/Carts";
import PaymentMethods from "~/models/PaymentMethods";
import DeleveryInfor from "~/components/DeliveryInfor";
import { CheckValueReturnTime } from "~/utils/findValueStore";
import calculatePriceByRom from "~/components/CalculatePriceByRom";
import { useQueryClient } from "@tanstack/react-query";
import { setResultValueStock } from "~/redux/addressSlice";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

function CheckOut() {
  dayjs.extend(customParseFormat);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userProfile = useSelector(
    (state: RootState) => state.userProfile.userProfile
  );
  const [deliveryTime, setDeliveryTime] = useState<Date | null>(null);

  console.log("hahahahhdahasdhasdhasdj: ", deliveryTime);

  const {
    addressData,
    selectIdAddress,
    addAddressData,
    selectIdStore,
    deliveryType,
  } = useSelector((state: RootState) => state.address);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderData>();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(null);

  const {
    selectedProducts,
    totalOriginalPrice,
    totalDiscountedPrice,
    totalDiscount,
  }: {
    selectedProducts: Carts[];
    totalOriginalPrice: number;
    totalDiscountedPrice: number;
    totalDiscount: number;
  } = location.state;

  useEffect(() => {
    if (selectedProducts.length === 0) {
      navigate("/");
    }
  }, [selectedProducts]);

  const repurchaseProducts = location.state?.repurchaseProducts;

  const productsToDisplay: Carts[] = repurchaseProducts || selectedProducts;

  const { mutate } = usePost();

  const { data: paymentMethods } = useGet<PaymentMethods[]>(
    "/paymentMethod/findAllPaymentMethod"
  );

  const { data: address } = useGet<Address[]>(
    `address/getAddressesByUser/${userProfile?.id}`
  );

  if (!selectedProducts) {
    console.error("Selected products are not available.");
  }

  useEffect(() => {
    const check = async () => {
      const productIds = productsToDisplay?.map(
        (product) => product.productData.id
      );

      const value = await CheckValueReturnTime(productIds, selectIdStore);

      const result =
        value.find((isStock) => isStock.stock === false) ||
        value.find((isStock) => isStock.stock === true);

      console.log("Holy shit aaaaaaaaaaaaa ", result);
      if (selectIdStore !== 0 && result?.stock === false) {
        setDeliveryTime(dayjs(result?.deliveryDate, "DD/MM/YYYY").toDate());
      }

      dispatch(setResultValueStock(result));
    };

    check();
  }, [productsToDisplay, dispatch, selectIdStore]);

  const createdOrder = async (
    userId: number,
    addressId: number | null,
    paymentMethodId: number,
    totalDiscountedPrice: number,
    phone: number,
    cart: Carts[],
    storeId: number | null,
    delivery_method: string,
    deliveryDate: Date | null
  ) => {
    try {
      await mutate(
        {
          url: "/orders/createOrder",
          data: {
            userId,
            addressId,
            phone,
            total: totalDiscountedPrice,
            statusId: 1,
            paymentMethodId,
            storeId: storeId,
            delivery_method,
            statusPayId: 1,
            deliveryDate,
          },
        },
        {
          onSuccess: async (response) => {
            queryClient.invalidateQueries({
              queryKey: [`/orders/getOrderByIdUser/${userProfile?.id}`],
            });
            console.log("Order created successfully: ", response);
            const orderId = response.data.newOrder.id;

            if (orderId && cart.length > 0) {
              const promises = cart.map((cart) => {
                if (!cart.id) return null;

                const detailOrder = {
                  orderId,
                  productId: cart.productData.id,
                  quantity: Number(cart.quantity),
                  total: cart.total,
                  color: cart.color,
                  size: cart.rom,
                };

                return mutate(
                  {
                    url: "/orderdetails/createOrderDetail",
                    data: detailOrder,
                  },
                  {
                    onSuccess: (response) => {
                      queryClient.invalidateQueries({
                        queryKey: [
                          `/orderdetails/getAllOrderDetailByOrderId/${orderId}`,
                        ],
                      });
                      console.log(
                        "Order detail created successfully: ",
                        response
                      );
                    },
                    onError: (error) => {
                      console.error("Error creating order detail: ", error);
                    },
                  }
                );
              });

              try {
                const results = await Promise.all(promises.filter(Boolean));

                if (selectedPaymentMethod === 1) {
                  const result = await handleBank.bank(
                    totalDiscountedPrice,
                    orderId
                  );
                  window.location.href = result.data.url;
                  return;
                }
              } catch (error) {
                console.error("Error creating order details:", error);
              }
            }
          },
          onError: (error) => {
            console.error("Error creating order:", error);
          },
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const onSubmit = async (data: OrderData) => {
    if (!userProfile) {
      toast.error("Xin hãy đăng nhập để tiếp tục");
      return;
    }
    if (deliveryType) {
      createdOrder(
        userProfile.id,
        null,
        data.paymentMethod,
        totalDiscountedPrice,
        userProfile?.phone,
        selectedProducts,
        selectIdStore,
        "Nhận tại cửa hàng",
        deliveryTime
      );
    }

    if (selectedPaymentMethod === null) {
      return;
    }
    if (address && selectIdAddress !== 0 && !addAddressData && !deliveryType) {
      await createdOrder(
        userProfile.id,
        selectIdAddress,
        data.paymentMethod,
        totalDiscountedPrice,
        userProfile?.phone,
        selectedProducts,
        null,
        "Giao hàng",
        deliveryTime
      );
    }
    if (addAddressData && !deliveryType) {
      mutate(
        { url: `/address/createAddress/`, data: addressData },
        {
          onSuccess: async (res) => {
            if (res.status === 200) {
              await createdOrder(
                userProfile.id,
                res.data.id,
                data.paymentMethod,
                totalDiscountedPrice,
                userProfile?.phone,
                selectedProducts,
                null,
                "Giao hàng",
                deliveryTime
              );
            }
          },
        }
      );
    }
  };

  return (
    <div className="px-40">
      <div className=" w-[600px] mx-auto">
        <h4 className="text-center text-3xl font-bold py-8">
          Xác nhận đơn hàng
        </h4>
        <NavCart />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container mx-auto py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="p-4 bg-white rounded-md shadow-sm">
              <h2 className="text-base font-semibold mb-4">
                Sản phẩm trong giỏ hàng
              </h2>
              <div className="space-y-4">
                {productsToDisplay &&
                  productsToDisplay?.map((productDetail, index) => {
                    const currentPrice = calculatePriceByRom(
                      productDetail.productData.price,
                      productDetail.rom
                    );
                    return (
                      <div
                        key={index}
                        className={`flex items-center space-x-4 pb-4 ${
                          productsToDisplay.length - 1 !== index &&
                          `border-b-[1px]`
                        }`}
                      >
                        <Image
                          src={
                            productDetail.productData.img ||
                            "https://via.placeholder.com/100"
                          }
                          alt={productDetail.productData.name}
                          className="size-16 object-cover rounded-lg"
                        />
                        <div className="space-y-2 w-full">
                          <div className="flex justify-between items-start">
                            <div className="w-full">
                              <h4 className="line-clamp-1 text-sm font-semibold w-2/3">
                                {productDetail.productData.name}{" "}
                                {productDetail.rom}
                              </h4>
                              <p className="text-xs text-gray-700">
                                Màu sắc: {productDetail.color}
                              </p>
                              <p className="text-xs text-gray-700">
                                Số lượng: {productDetail.quantity}
                              </p>
                            </div>
                            <div>
                              <p className="text-red-600 text-base font-semibold">
                                {currentPrice.toLocaleString("vi-VN")}đ
                              </p>
                              <p className="text-sm line-through text-gray-500">
                                {Math.round(
                                  currentPrice /
                                    (1 -
                                      productDetail.productData.discount / 100)
                                ).toLocaleString("vi-VN")}
                                đ
                              </p>
                            </div>
                          </div>
                          {/* <p>
                            {valueCheck.stock
                              ? valueCheck.pickupTime
                              : valueCheck.deliveryTime}
                          </p> */}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <DeleveryInfor />

            {/* Phương thức thanh toán */}
            <div className="p-4 bg-white rounded-md shadow-sm">
              <h2 className="text-base font-semibold mb-4">
                Phương thức thanh toán
              </h2>
              <div className="space-y-4">
                {paymentMethods &&
                  paymentMethods.map((paymentMethod) => (
                    <label
                      key={paymentMethod.id}
                      className="block cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={paymentMethod.id}
                        {...register("paymentMethod", {
                          required: "Vui lòng chọn phương thức thanh toán",
                        })}
                        className="form-radio h-4 w-4"
                        onChange={(e) => {
                          setSelectedPaymentMethod(Number(e.target.value));
                        }}
                      />
                      <span className="ml-2 text-gray-700">
                        {paymentMethod.type}
                      </span>
                    </label>
                  ))}
                {errors.paymentMethod && (
                  <span className="text-sm text-red-500">
                    {errors.paymentMethod.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tóm tắt đơn hàng + Phần right */}
          <div className="sticky top-[92px] max-h-[40vh] p-4 bg-white rounded shadow-sm">
            <div className="">
              <h2 className="text-base font-semibold mb-3">
                Thông tin đơn hàng
              </h2>
              {/* Tổng tiền */}
              <div className="flex justify-between">
                <span className="text-gray-700">Tổng tiền</span>
                <span className="font-semibold">
                  {totalOriginalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <hr className="my-2" />
              {/* Tổng khuyến mãi */}
              <div className="flex justify-between">
                <span className="text-gray-700">Tổng khuyến mãi</span>
                <span className="font-semibold">
                  {totalDiscount.toLocaleString("vi-VN")}đ
                </span>
              </div>

              {/* Phí vận chuyển */}
              <div className="flex justify-between mt-2">
                <span className="text-gray-700">Phí vận chuyển</span>
                <span className="text-sm">Miễn phí</span>
              </div>
              <hr className="my-2" />
              {/* Tổng cần thanh toán */}
              <div className="flex justify-between">
                <span className="text-gray-700">Cần thanh toán</span>
                <span className="font-semibold text-red-600 text-lg">
                  {totalDiscountedPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
            {/* nút submit */}
            <div>
              <button
                type="submit"
                className="w-full mt-4 bg-[#eb3e32] text-white p-3 rounded-lg font-semibold duration-300 hover:bg-red-600"
              >
                Đặt hàng
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CheckOut;
