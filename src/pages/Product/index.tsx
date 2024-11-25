/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { BsFillCartFill } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import useGet from "~/hooks/useGet";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import usePost from "~/hooks/usePost";
import { AppDispatch, RootState } from "~/redux/store";
import { addProduct, updateQuantity } from "~/redux/cartSlice";
import { useQueryClient } from "@tanstack/react-query";
import currencyFormat from "~/components/CurrencyFormat";
import GetProducts from "~/features/getProducts";
import Products from "~/models/Products";
import Categories from "~/models/Categories";
import ValueAttribute from "~/models/ValueAttribute";
import Button from "~/components/Button";
import CommentComponent from "~/components/Comment";
import { MdDeleteForever } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";
import StoreProduct from "~/components/store";
import AttributeColorRom from "~/components/AttributeColorRom";
import ProductImg from "~/components/ProductImg";
import Confirmed from "~/components/Confirmed";
import Modal from "~/components/Modal";
import calculatePriceByRom from "~/components/CalculatePriceByRom";
import { parseCapacityValue, getSmallestRom } from "~/components/ConvertRom";
import Carts from "~/models/Carts";

function Product() {
  const queryClient = useQueryClient();
  const [capacity, setCapacity] = useState(0);
  const [colors, setColors] = useState(0);
  const [capacitySmall, setCapacitySmall] = useState<string | undefined>(undefined);
  const { slugCategory, slugProduct } = useParams();

  const navigate = useNavigate();
  const userProfile = useSelector(
    (state: RootState) => state.userProfile.userProfile
  );
  const cartProducts = useSelector(
    (state: RootState) => state.cart.cartProducts
  );

  const { mutate } = usePost();

  const { data: products } = useGet<{ total: number; rows: Products[] }>(
    `/products/getProductCategory/${slugCategory}`
  );
  const { data: productDetail } = useGet<Products>(
    `/products/getOneProduct/${slugProduct}`
  );

  const { data: attributeValue } = useGet<ValueAttribute[]>(
    `/valueAttribute/getOneValueAttributeById/${productDetail?.id}`
  );

  const { data: carts } = useGet<{ count: number; rows: Carts[] }>(`/cart/getAllCartByUserId/${userProfile?.id}`);

  const dispatch = useDispatch<AppDispatch>();

  // Lấy ROM nhỏ nhất khi trang load nếu là điện thoại hoặc tablet
  useEffect(() => {
    if (slugCategory === "dien-thoai" || slugCategory === "tablet") {
      const smallestRom = getSmallestRom({
        attributeValue,
      });
      if (smallestRom) {
        setCapacitySmall(smallestRom.value); // Lưu ID của ROM nhỏ nhất
        // Set capacity cho ROM nhỏ nhất
        setCapacity(smallestRom.id);
      }
    }
  }, [attributeValue, slugCategory]);

  // Xử lý lấy dữ liệu color và rom từ attributeValue
  const getColorAndRomFromAttributeValue = () => {
    if (attributeValue && attributeValue.length > 0) {
      const firstColor = attributeValue.find(
        (item) => item.attributeData.id === 4 || item.attributeData.id === 29
      );
      if (firstColor) setColors(firstColor.id);

      // Chỉ đặt dung lượng nếu là điện thoại hoặc tablet
      if (slugCategory === "dien-thoai" || slugCategory === "tablet") {
        const firstCapacity = attributeValue.find(
          (item) => item.attributeData.id === 6
        );
        if (firstCapacity) setCapacity(firstCapacity.id);
      }
    }
  };

  // Gọi hàm này khi component load hoặc khi `attributeValue` và `slugCategory` thay đổi
  useEffect(() => {
    getColorAndRomFromAttributeValue();
  }, [attributeValue, slugCategory]);

  //Handle Color change
  const handleColorChange = (id: number) => {
    setColors(id);
  };

  //Handle Capacity change
  const handleCapacityChange = (id: number) => {
    setCapacity(id);
  };

  // Lấy thông tin màu sắc và dung lượng hiện tại từ attributeValue
  const selectedColor = attributeValue?.find(
    (item) => (item.attributeData.id === 4 || item.attributeData.id === 29) && item.id === colors
  );

  const selectedRomAsPhoneAndTablet = attributeValue?.find(
    (item) => item.attributeData.id === 6 && item.id === capacity
  );

  const selectedRom = attributeValue?.find(
    (item) => item.attributeData.id === 6
  );

  // Xác định giá dựa trên hệ số ROM
  const romValue = selectedRomAsPhoneAndTablet
    ? selectedRomAsPhoneAndTablet?.value
    : selectedRom?.value || null

  // Giá hiện tại dựa trên ROM
  const currentPrice = romValue === capacitySmall ? productDetail?.price || 0 : calculatePriceByRom(productDetail?.price || 0, romValue || '');

  const handleAddToCart = (product: Products) => {
    if (userProfile && userProfile.ban === true) {
      toast.error("Tài khoản của bạn bị chặn");
      return;
    }

    if (product.stock <= 2) {
      toast.error("Sản phẩm này hết hàng! Chúng tôi sẽ cập nhật lại sản phẩm trong thời gian sóm nhất");
      return;
    }
    const stockProd = product.stock - 2
    const quantityProd = carts
      ? carts?.rows.find(item => item.productData.id === product.id && item.rom === romValue && item.color === selectedColor?.value)
      : cartProducts.find(item => item.id === product.id && item.rom === romValue && item.color === selectedColor?.value)

    if (quantityProd && quantityProd?.quantity >= stockProd) {
      toast.error("Sản phẩm này hết hàng! Chúng tôi sẽ cập nhật lại sản phẩm trong thời gian sốm nhất");
      return
    }

    if (userProfile) {

      // Dữ liệu cho cart
      const data: {
        userId: number;
        productId: number;
        quantity: number;
        color: string | null;
        rom: string | null;
        total: number;
      } = {
        userId: userProfile.id,
        productId: product.id,
        quantity: 1,
        color: selectedColor?.value || null,
        rom: romValue || null,
        total: currentPrice,
      };

      mutate(
        {
          url: "cart/createCart",
          data,
        },
        {
          onSuccess: (res) => {
            console.log(res);
            if (res.status === 200) {
              toast.success("Sản phẩm đã được cập nhật trong giỏ hàng.");
              queryClient.invalidateQueries({
                queryKey: [`/cart/getAllCartByUserId/${userProfile.id}`],
              });
            }
          },
          onError: (error) => {
            console.log(error);
          },
        }
      );
    } else {
      const productToAdd = {
        ...product,
        userId: null,
        quantity: 1, // Khởi tạo số lượng cho sản phẩm
        color: selectedColor?.value || null,
        rom: selectedRomAsPhoneAndTablet
          ? selectedRomAsPhoneAndTablet?.value
          : selectedRom?.value || null,
        total: product.price,
      };

      const existingProductIndex = cartProducts.findIndex(
        (item) =>
          item.id === productToAdd.id &&
          item.rom === productToAdd.rom &&
          item.color === productToAdd.color
      );

      if (existingProductIndex === -1) {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
        dispatch(addProduct(productToAdd));
        toast.success("Sản phẩm đã được thêm vào giỏ hàng.");
      } else {
        const updatedProduct = {
          ...productToAdd,
          quantity: cartProducts[existingProductIndex].quantity + 1,
        };
        dispatch(updateQuantity({
          id: productToAdd.id,
          rom: productToAdd.rom,
          color: productToAdd.color,
          quantity: updatedProduct.quantity
        }));
        toast.success("Sản phẩm đã được cập nhật trong giỏ hàng.");
      }
    }
  };

  const handleBuyNow = (product: Products) => {
    if (userProfile && userProfile.ban === true) {
      // Nếu đã đăng nhập nhưng tài khoản bị chặn, hiển thị thông báo
      toast.error("Tài khoản của bạn đã bị chặn");
      return;
    }

    if (product.stock <= 2) {
      toast.error("Sản phẩm này hết hàng! Chúng tôi sẽ cập nhật lại sản phẩm trong thời gian sốm nhất");
      return
    }

    if (userProfile) {
      // Dữ liệu cho cart
      const data: {
        userId: number;
        productId: number;
        quantity: number;
        color: string | null;
        rom: string | null;
        total: number;
      } = {
        userId: userProfile.id,
        productId: product.id,
        quantity: 1, // Luôn gửi số lượng 1, backend sẽ xử lý tăng số lượng
        color: selectedColor?.value || null,
        rom: romValue || null,
        total: currentPrice,
      };

      mutate(
        {
          url: "cart/createCart",
          data,
        },
        {
          onSuccess: (res) => {
            console.log(res);
            if (res.status === 200) {
              toast.success("Sản phẩm đã được cập nhật trong giỏ hàng.");
              queryClient.invalidateQueries({
                queryKey: [`/cart/getAllCartByUserId/${userProfile.id}`],
              });
              navigate("/cart");
            }
          },
          onError: (error) => {
            console.log(error);
          },
        }
      );
    } else {
      const productToAdd = {
        ...product,
        userId: null,
        quantity: 1, // Khởi tạo số lượng cho sản phẩm
        color: selectedColor?.value || null,
        rom: selectedRomAsPhoneAndTablet
          ? selectedRomAsPhoneAndTablet?.value
          : selectedRom?.value || null,
        total: product.price,
      };

      const existingProductIndex = cartProducts.findIndex(
        (item) =>
          item.id === productToAdd.id &&
          item.rom === productToAdd.rom &&
          item.color === productToAdd.color
      );

      if (existingProductIndex === -1) {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
        dispatch(addProduct(productToAdd));
        toast.success("Sản phẩm đã được thêm vào giỏ hàng.");
        navigate("/cart");
      } else {
        const updatedProduct = {
          ...productToAdd,
          quantity: cartProducts[existingProductIndex].quantity + 1,
        };
        dispatch(updateQuantity({
          id: productToAdd.id,
          rom: productToAdd.rom,
          color: productToAdd.color,
          quantity: updatedProduct.quantity
        }));
        toast.success("Sản phẩm đã được cập nhật trong giỏ hàng.");
        navigate("/cart");
      }
    }
  };
  return (
    <>
      <section className="flex justify-between space-x-4 px-40 py-10 bg-white">
        {productDetail && (
          <>
            <article className="w-1/2">
              {/* AnhSanPham */}
              <div className="flex flex-col lg:flex-row lg:items-center px-10 pb-3 mx-10">
                <div className="w-[454px] flex flex-col justify-center gap-6">
                  <ProductImg id={productDetail.id} img={productDetail.img} />
                </div>
              </div>
              <hr className="my-7" />
            </article>
            <div className="w-1/2">
              <span className="line-clamp-2 text-4xl font-semibold mb-4">
                {productDetail.name}
              </span>

              <AttributeColorRom
                attributeValue={attributeValue || []}
                productDetail={productDetail}
                slugCategory={slugCategory || ""}
                colors={colors}
                capacity={capacity}
                handleColorChange={handleColorChange}
                handleCapacityChange={handleCapacityChange}
              />

              {/* Tien */}
              <div className="flex flex-col gap-y-2 p-5 border border-gray-400 mb-4 rounded-lg">
                <span className="text-3xl font-bold text-[#FF0000]">
                  {currentPrice.toLocaleString()} đ
                </span>
                <p>
                  <span className="text-base text-[#6C7275] line-through mr-3">
                    {currencyFormat({ paramFirst: productDetail.price, paramSecond: productDetail.discount })}đ
                  </span>
                  <span className="text-base text-red-500">
                    {productDetail.discount}%
                  </span>
                </p>
              </div>
              {/* Nutthaotac */}
              {productDetail.stock > 0 ? (
                <div className="flex gap-4 mb-4">
                  <button
                    className="bg-[#eb3e32] size-12 px-3 py-3 rounded duration-300 hover:bg-red-600"
                    onClick={() => {
                      handleAddToCart(productDetail);
                    }}
                  >
                    <BsFillCartFill className="text-white text-2xl" />
                  </button>
                  <button
                    className="w-full bg-[#eb3e32] px-20 h-12 rounded duration-300 hover:bg-red-600"
                    onClick={() => {
                      handleBuyNow(productDetail);
                    }}
                  >
                    <span className="text-lg text-white">Mua ngay</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Out of Stock Message */}
                  <div className="flex flex-col gap-y-2 p-5 border border-red-500 bg-red-100 mb-4 rounded text-center">
                    <span className="text-sm font-semibold text-red-600">
                      Sản phẩm hiện tại đang tạm hết hàng, quý khách có thể đặt
                      trước sản phẩm hoặc tham khảo sản phẩm tương tự!
                    </span>
                  </div>
                </>
              )}
              <StoreProduct id={productDetail.id} />
              <Confirmed />
            </div>
          </>
        )}
      </section>

      <section className="mt-10 px-4 md:px-40">
        <section className="mt-10 grid grid-cols-3 gap-x-7">
          <CommentComponent id={productDetail?.id} />

          <div className="col-span-1 bg-white w-full p-4 rounded h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold mb-2">Thông số kĩ thuật</h3>
              <Button
                onClick={() => {
                  console.log("123");
                }}
                className="text-blue-500 text-sm font-semibold"
              >
                Tất cả thông số
              </Button>
            </div>
            <table className="w-full rounded-sm overflow-hidden">
              <tbody className="text-center">
                {attributeValue &&
                  attributeValue
                    .filter((valueAttribute) => {
                      if (
                        slugCategory === "dien-thoai" ||
                        slugCategory === "tablet"
                      ) {
                        return (
                          valueAttribute.attributeData.id !== 4 &&
                          valueAttribute.attributeData.id !== 29 &&
                          valueAttribute.attributeData.id !== 6
                        );
                      }
                      return (
                        valueAttribute.attributeData.id !== 4 &&
                        valueAttribute.attributeData.id !== 29
                      );
                    })
                    .map((valueAttribute) => (
                      <tr
                        key={valueAttribute.id}
                        className="odd:bg-[#ececec] font-medium text-sm"
                      >
                        <td className="w-2/5 py-2 text-[#6C7275]">
                          {valueAttribute.attributeData.name}
                        </td>
                        <td className="w-3/5 py-2 text-black">
                          {valueAttribute.value}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="bg-white p-5 rounded-lg mt-10">
          <h2 className="text-2xl font-semibold pb-8">Sản Phẩm Cùng Loại</h2>
          <GetProducts
            products={products?.rows ?? []}
            breakpoints={{
              320: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 5 },
            }}
            spaceBetween={20}
            pagination={true}
            navigation={true}
            className="relative group p-3"
          />
        </section>
      </section>
    </>
  );
}

export default Product;
