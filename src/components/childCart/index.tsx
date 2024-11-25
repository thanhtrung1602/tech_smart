import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useDelete, usePatch } from "~/hooks/usePost";
import { removeProduct, updateQuantity } from "~/redux/cartSlice";
import { AppDispatch, RootState } from "~/redux/store";
import Image from "../Image";
import Carts from "~/models/Carts";
import useGet from "~/hooks/useGet";
import useDebounce from "~/hooks/useDebounce";
import toast from "react-hot-toast";
import calculatePriceByRom from "../CalculatePriceByRom";
import { getSmallestRom } from "../ConvertRom";

interface ChildCartProps {
  id: number;
  price: number;
  discount: number;
  img: string;
  name: string;
  idCart?: number;
  rom: string;
  color: string;
  selectedItems: { [key: number]: boolean };
  handleSelectItem: (idCart: number) => void;
}

function ChildCart({
  id,
  price,
  discount,
  img,
  name,
  idCart,
  rom,
  color,
  selectedItems,
  handleSelectItem,
}: ChildCartProps) {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector((state: RootState) => state.userProfile.userProfile);
  const cart = useSelector((state: RootState) => state.cart.cartProducts);

  const { mutate } = useDelete();
  const { mutate: updateQuantityData } = usePatch();

  const { data: carts } = useGet<{ count: number; rows: Carts[] }>(`/cart/getAllCartByUserId/${userProfile?.id}`, {
    enabled: !!userProfile,
  });

  const [quantities, setQuantities] = useState<{ [key: number | string]: number }>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [capacitySmall, setCapacitySmall] = useState<string | undefined>(undefined);

  const debouncedQuantity = useDebounce(quantities[idCart || `${id}-${rom}-${color}`], 1000); // Debounce for 1 second

  // Effect to initialize quantities state from fetched carts
  useEffect(() => {
    const items = userProfile ? carts?.rows || [] : cart || []; // Use carts if logged in, otherwise use cart from local storage
    console.log(userProfile ? "Carts item" : "Cart item", items);

    const initialQuantities = items.reduce((acc, item) => {
      acc[userProfile ? item.id : `${item.id}-${item.rom}-${item.color}`] = Number(item.quantity) || 1; // Default quantity is 1 if not found
      return acc;
    }, {} as { [key: number | string]: number });

    console.log("Initial Quantities:", initialQuantities);


    setQuantities(initialQuantities);
  }, [carts || cart]);

  // Effect to call API when quantity changes (debounced)
  useEffect(() => {
    if (debouncedQuantity !== quantities[idCart || `${id}-${rom}-${color}`]) {
      handleDebouncedQuantityUpdate(idCart || id, rom, color, debouncedQuantity);
    }
  }, [debouncedQuantity]);

  // Effect để lấy ROM nhỏ nhất và cập nhật giá khi trang được load
  // useEffect(() => {
  //   const smallestRomId = getSmallestRom(); // Giả sử bạn có hàm này để lấy ROM nhỏ nhất
  //   if (smallestRomId) {
  //     setCapacitySmall(smallestRomId);
  //   }
  // }, [carts, cart]);

  // Lấy thông tin tồn kho từ `carts` (DB) hoặc từ Redux
  const getProductStock = (id: number, rom: string, color: string) => {
    // Nếu người dùng đã đăng nhập, lấy stock từ DB
    if (userProfile && carts) {
      const cartItem = carts.rows.find(item => item.id === id);
      return cartItem ? cartItem.productData.stock : 0;
    }
    // Nếu người dùng chưa đăng nhập, lấy stock từ Redux
    const cartItem = cart.find(item => item.id === id && item.rom === rom && item.color === color);
    return cartItem ? cartItem.stock : 0;
  };

  // Handle removing product from cart
  const handleRemoveProduct = (id: number, rom: string, color: string) => {
    if (userProfile) {
      if (carts && carts?.count > 1) {
        mutate(`/cart/deleteCartItem/${idCart}`, {
          onSuccess: () => {
            toast.success("Đã xóa sản phẩm trong giỏ hàng");
            queryClient.invalidateQueries({ queryKey: [`/cart/getAllCartByUserId/${userProfile.id}`] });
          },
          onError: (error) => console.log(error),
        });
      } else {
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
      }
      if (carts && carts?.count === 0) {
        toast.loading("Hiện không có sản phẩm trong giỏ hàng");
      }
    } else {
      dispatch(removeProduct({ id, rom, color }));
    }
  };

  const handleQuantityChange = (id: number, rom: string, color: string, newQuantity: number) => {
    const quantityToUpdate = Math.min(Math.max(newQuantity || 1, 1), 10);
    const stockProd = getProductStock(id, rom, color) - 2; // Lấy tồn kho từ local hoặc server    

    // Kiểm tra nếu số lượng giỏ hàng cộng thêm 1 sẽ vượt quá tồn kho còn lại
    if (quantityToUpdate > stockProd) { // Giữ lại ít nhất 2 sản phẩm trong kho
      toast.error(`Sản phẩm đã hết hàng. Chúng tôi sẽ cập nhật lại!`);
      return;
    }

    if (!userProfile && !carts?.rows) {
      dispatch(updateQuantity({ id, rom, color, quantity: quantityToUpdate }));
      setQuantities((prev) => ({
        ...prev,
        [`${id}-${rom}-${color}`]: quantityToUpdate, // Cập nhật với giá trị hợp lệ
      }));
      console.log("Cart:", quantities);
      return;
    } else {
      // Cập nhật state một lần duy nhất
      setQuantities((prev) => ({
        ...prev,
        [id]: quantityToUpdate,  // Cập nhật cho id cụ thể
      }));

      console.log("Carts:", quantities);

      // Gọi API sau khi số lượng thay đổi
      setIsUpdating(true);
      updateQuantityData(
        {
          url: `/cart/updateQuantity/${id}`,
          data: { quantity: quantityToUpdate, rom, color },
        },
        {
          onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: [`/cart/getAllCartByUserId/${userProfile?.id}`] });
            setIsUpdating(false);  // Dừng spinner sau khi API thành công
          },
          onError: (error) => {
            console.log(error);
            setIsUpdating(false);  // Dừng spinner nếu gặp lỗi
          },
        }
      );
    }
  };

  // Handle debounced quantity update
  const handleDebouncedQuantityUpdate = (id: number, rom: string, color: string, newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 10) {
      handleQuantityChange(id, rom, color, newQuantity);
    }
  };

  // Giá hiện tại dựa trên ROM
  const currentPrice = useMemo(() => calculatePriceByRom(price || 0, rom || ''), [rom]);

  // Tính toán tổng giá trị một lần duy nhất
  const totalPrice = currentPrice * (quantities[idCart || `${id}-${rom}-${color}`] ?? 1);
  const originalPrice = Math.round(currentPrice / (1 - discount / 100)) * (quantities[idCart || `${id}-${rom}-${color}`] ?? 1);

  return (
    <>
      <section key={id}>
        <article className="flex justify-between py-[24px] items-center">
          <div className="flex gap-4 items-center">
            <div className="py-[24px]">
              <input
                type="checkbox"
                className="size-4 bg-gray-200 checked:bg-blue-500 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                checked={idCart ? selectedItems[idCart] || false : selectedItems[id] || false}
                onChange={() => handleSelectItem(idCart || id)}
              />
            </div>
            <div className="w-[66px] h-[76px]">
              <Image src={img} alt={name} className="object-cover w-full h-full" />
            </div>
            <div className="max-w-[230px]">
              <p className="line-clamp-2">{name} {rom}</p>
              <p className="text-[15px] text-[#6C7275]">Màu: {color}</p>
            </div>
          </div>
          <div className="h-[32px] w-[80px] flex justify-around border-[1px] border-black py-[12px] px-[8px] rounded-[4px] items-center">
            <p className="cursor-pointer" onClick={() => handleQuantityChange(idCart || id, rom, color, quantities[idCart || `${id}-${rom}-${color}`] - 1)}>-</p>
            <input
              type="text"
              value={quantities[idCart || `${id}-${rom}-${color}`] || 1}
              onChange={(e) => {
                const newQuantity = Number(e.target.value);
                handleQuantityChange(idCart || id, rom, color, newQuantity);
              }}
              className="w-[24px] bg-transparent outline-none text-center"
            />
            <p className="cursor-pointer" onClick={() => handleQuantityChange(idCart || id, rom, color, quantities[idCart || `${id}-${rom}-${color}`] + 1)}>+</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{totalPrice.toLocaleString("vi-VN")}đ</p>
            <del className="text-[13px]">{originalPrice.toLocaleString("vi-VN")}đ</del>
          </div>
          <div onClick={() => handleRemoveProduct(idCart || id, rom, color)} className="p-2 cursor-pointer">
            <MdDeleteForever className="size-6 text-red-500" />
          </div>
        </article>
      </section>
      {/* {isUpdating && <Spinner />} Show spinner when updating */}
    </>
  );
}

export default ChildCart;