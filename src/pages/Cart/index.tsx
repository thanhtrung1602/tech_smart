import { useState, useMemo, useEffect } from "react";
/* eslint-disable @typescript-eslint/no-unused-vars */
import NavCart from "~/layouts/components/NavCart";
import { useDispatch, useSelector } from "react-redux";
import Carts from "~/models/Carts";
import { MdDeleteForever } from "react-icons/md";
import Image from "~/components/Image";
import emptyCart from "~/assets/images/empty_cart.png";
import { useNavigate } from "react-router-dom";
import Button from "~/components/Button";
import { AppDispatch, RootState } from "~/redux/store";
import toast from "react-hot-toast";
import useGet from "~/hooks/useGet";
import { useDelete } from "~/hooks/usePost";
import { useQueryClient } from "@tanstack/react-query";
import ChildCart from "~/components/ChildCart";
import calculatePriceByRom from "~/components/CalculatePriceByRom";
import { removeCart } from "~/redux/cartSlice";

function Cart() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector(
    (state: RootState) => state.userProfile.userProfile
  );

  const { data: carts } = useGet<{ count: number; rows: Carts[] }>(
    `/cart/getAllCartByUserId/${userProfile?.id}`,
    {
      enabled: !!userProfile,
    }
  );
  const cart = useSelector((state: RootState) => state.cart.cartProducts);
  const { mutate } = useDelete();

  const navigate = useNavigate();


  const [quantities, setQuantities] = useState<{
    [key: number | string]: number;
  }>({});
  const [selectedItems, setSelectedItems] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    // Set quantities and selectedItems based on available data source
    const initialQuantities: { [key: string | number]: number } = {};
    const initialSelectedItems: { [key: number]: boolean } = {};

    const items = carts?.rows || cart || []; // Use carts if logged in, otherwise use cart from local storage
    items.forEach((item) => {
      const key = carts?.rows
        ? item.id
        : `${item.id}-${item.rom}-${item.color}`;
      initialQuantities[key] = item.quantity || 1; // Default quantity to 1 if undefined
      initialSelectedItems[item.id] = true; // Default selection state to true
    });

    setQuantities(initialQuantities);
    setSelectedItems(initialSelectedItems);
  }, [carts, cart]); // Depend on both carts and cart

  // Function to toggle selection of individual items
  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Function to toggle select all items
  const handleSelectAll = () => {
    const items = carts?.rows || cart || [];
    const allSelected = !Object.values(selectedItems).every(Boolean);
    const updatedSelectedItems = items.reduce((acc, item) => {
      acc[item.id] = allSelected;
      return acc;
    }, {} as { [key: number]: boolean });

    setSelectedItems(updatedSelectedItems);
  };

  // Memoized calculation for total original price
  const totalOriginalPrice = useMemo(() => {
    const items = carts?.rows || cart || [];
    return items.reduce((total, productDetail) => {
      if (selectedItems[productDetail.id]) {
        const price = carts?.rows
          ? calculatePriceByRom(
            productDetail.productData.price,
            productDetail.rom
          )
          : calculatePriceByRom(productDetail.price, productDetail.rom);
        const discount =
          productDetail.productData?.discount || productDetail.discount;
        return (
          total +
          Math.round(price / (1 - discount / 100)) *
          (quantities[
            carts?.rows
              ? productDetail.id
              : `${productDetail.id}-${productDetail.rom}-${productDetail.color}`
          ] || 1)
        );
      }
      return total;
    }, 0);
  }, [carts || cart, selectedItems, quantities]);

  // Memoized calculation for total discounted price
  const totalDiscountedPrice = useMemo(() => {
    const items = carts?.rows || cart || [];
    return items.reduce((total, productDetail) => {
      if (selectedItems[productDetail.id]) {
        const price = carts?.rows
          ? calculatePriceByRom(
            productDetail.productData.price,
            productDetail.rom
          )
          : calculatePriceByRom(productDetail.price, productDetail.rom);
        return (
          total +
          price *
          (quantities[
            carts?.rows
              ? productDetail.id
              : `${productDetail.id}-${productDetail.rom}-${productDetail.color}`
          ] || 1)
        );
      }
      return total;
    }, 0);
  }, [carts || cart, selectedItems, quantities]);

  const totalDiscount = useMemo(() => {
    return totalOriginalPrice - totalDiscountedPrice;
  }, [totalOriginalPrice, totalDiscountedPrice]);

  const handleRemoveCart = () => {
    if (!userProfile) {
      dispatch(removeCart());
      return;
    }
    mutate(`/cart/clearCart/${userProfile?.id}`, {
      onSuccess: (res) => {
        if (res.status === 200) {
          toast.success("Đã xóa tất cả sản phẩm trong giỏ hàng");
          queryClient.invalidateQueries({
            queryKey: [`/cart/getAllCartByUserId/${userProfile?.id}`],
          });
        }
      },
      onError: (error) => console.log(error),
    });
  };

  // Hàm xử lý khi nhấn nút xác nhận
  const handleConfirmClick = () => {
    if (!userProfile) {
      // Nếu chưa đăng nhập, ngăn không cho chuyển trang và hiển thị toast
      toast.error("Yêu cầu đăng nhập");
      return navigate("/login");
    } else if (userProfile.ban === true) {
      // Nếu đã đăng nhập nhưng tài khoản bị chặn, hiển thị thông báo
      toast.error("Tài khoản của bạn đã bị chặn");
      return;
    }

    const selectedProducts = carts?.rows.filter(
      (productDetail) => selectedItems[productDetail.id]
    );

    if (selectedProducts?.length === 0) {
      // Nếu không có sản phẩm được chọn, ngăn không cho chuyển trang và hiển thị toast
      toast.error("Vui lòng chọn ít nhất một sản phẩm");
      return; // Dừng lại không chuyển trang
    }

    navigate("/checkout", {
      state: {
        selectedProducts,
        totalOriginalPrice,
        totalDiscountedPrice,
        totalDiscount,
      },
    });
  };

  return (
    <div className="px-40">
      <div className="w-[600px] mx-auto">
        <h4 className="text-center text-3xl font-bold py-8">Giỏ hàng</h4>
        <NavCart />
      </div>
      <div className="min-h-28 py-10 m-auto">
        <div className="flex gap-3">
          <div className="w-2/3 min-h-28 p-8 bg-white rounded-md shadow-sm">
            {cart.length > 0 || (carts && carts?.rows.length > 0) ? (
              <div>
                <div className="flex justify-between pb-4 border-b-[1px] border-black">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="size-4 bg-gray-200 checked:bg-blue-500 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      checked={Object.values(selectedItems).every(Boolean)}
                      onChange={handleSelectAll}
                    />
                    <div>
                      Chọn tất cả ({cart?.length || carts?.rows.length})
                    </div>
                  </div>
                  <div
                    onClick={handleRemoveCart}
                    className="p-2 cursor-pointer"
                  >
                    <MdDeleteForever className="size-6 text-red-500" />
                  </div>
                </div>
                {userProfile
                  ? carts?.rows.map((productDetail) => (
                    <ChildCart
                      key={productDetail.id}
                      idCart={productDetail.id}
                      id={productDetail.productData.id}
                      price={productDetail.productData.price}
                      discount={productDetail.productData.discount}
                      img={productDetail.productData.img}
                      name={productDetail.productData.name}
                      rom={productDetail.rom}
                      color={productDetail.color}
                      selectedItems={selectedItems}
                      handleSelectItem={handleSelectItem}
                    />
                  ))
                  : cart.map((productDetail, index) => (
                    <ChildCart
                      key={index}
                      id={productDetail.id}
                      img={productDetail.img}
                      name={productDetail.name}
                      price={productDetail.price}
                      discount={productDetail.discount}
                      rom={productDetail.rom}
                      color={productDetail.color}
                      selectedItems={selectedItems}
                      handleSelectItem={handleSelectItem}
                    />
                  ))}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center">
                <Image src={emptyCart} alt="Empty Cart" />
                <p className="text-center">
                  Chưa có sản phẩm nào trong giỏ hàng
                </p>
              </div>
            )}
          </div>
          <div className="sticky max-h-[90vh] top-[92px] w-2/6 min-h-28 p-8 bg-white rounded-md shadow-sm">
            <div className="mb-[30px] text-[20px]">
              <h3>Thông tin đơn hàng</h3>
            </div>
            <div className="mb-[15px]">
              <div>
                <div className="flex justify-between py-[13px]">
                  <p>Tổng tiền</p>
                  <p className="font-bold">
                    {totalOriginalPrice.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
              <hr />
              <div className="">
                <div className="flex justify-between py-[13px]">
                  <p>Tổng khuyến mãi</p>
                  <p className="font-bold">
                    {totalDiscount.toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div className="flex justify-between py-[13px]">
                  <p>Phí vận chuyển</p>
                  <p className="">Miễn phí</p>
                </div>
              </div>
              <hr />
              <div>
                <div className="flex justify-between py-[13px] font-bold">
                  <p>Cần thanh toán</p>
                  <div className="font-bold">
                    <p className="font-bold text-red-600">
                      {totalDiscountedPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {totalDiscountedPrice > 0 ? (
                <Button
                  className="block w-full text-center bg-[#eb3e32] text-white py-3 rounded-md duration-300 hover:bg-red-600"
                  onClick={handleConfirmClick}
                >
                  Xác nhận đơn
                </Button>
              ) : (
                <Button className="text-center bg-[#cccccc] text-white w-full py-2 rounded-md">
                  Xác nhận đơn
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
