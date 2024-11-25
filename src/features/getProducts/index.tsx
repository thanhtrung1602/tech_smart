import { Link } from "react-router-dom";
import currencyFormat from "~/components/CurrencyFormat";
import Image from "~/components/Image";
import SwiperCarousel from "~/components/Swiper";
import Products from "~/models/Products";

type PropProducts = {
  products: Products[];
  breakpoints?: {
    [key: number]: {
      slidesPerView: number;
    };
  };
  spaceBetween: number;
  pagination: boolean;
  navigation: boolean;
  className?: string;
};

function GetProducts({
  products,
  breakpoints,
  spaceBetween,
  pagination = true,
  navigation = true,
  className,
}: PropProducts) {
  return (
    <>
      <SwiperCarousel<Products>
        items={products}
        className={className}
        breakpoints={breakpoints}
        spaceBetween={spaceBetween}
        pagination={pagination}
        navigation={navigation}
      >
        {(product) => (
          <div className="flex flex-col justify-between relative h-full p-5 rounded-lg bg-white overflow-hidden select-none hover:shadow-lg duration-300 ">
            {/* Dải giảm giá */}
            <span className="absolute top-0 left-0 rounded-tr-full rounded-br-full px-4 text-white text-xs font-semibold py-[6px] bg-[#eb3e32] z-10">
              Giảm {product.discount}%
            </span>
            {/* Link sản phẩm */}
            <Link to={`/product/${product.categoryData.slug}/${product.slug}`}>
              {/* Vùng hiển thị ảnh sản phẩm */}
              <div className="h-[190px] mb-[2px] flex justify-center items-center overflow-hidden image-container">
                <Image
                  src={product.img}
                  fallbackSrc=""
                  alt="Image Product"
                  className="w-5/5 h-full object-cover"
                />
              </div>
              {/* Tên sản phẩm */}
              <p className="line-clamp-2 font-medium text-sm pt-1 duration-200">
                {product.name}
              </p>
            </Link>

            {/* Thông tin giá */}
            <div className="flex flex-col">
              <span className="font-normal text-sm text-gray-500 line-through">
                {currencyFormat({
                  paramFirst: product.price,
                  paramSecond: product.discount,
                })}
              </span>
              <span className="font-semibold text-lg text-red-600">
                {product.price.toLocaleString()}đ
              </span>
              <span className="text-xs text-green-600">
                Giảm{" "}
                {(
                  Math.round(
                    product.price / (1 - product.discount / 100) / 1000
                  ) *
                    1000 -
                  product.price
                ).toLocaleString()}
                đ
              </span>
            </div>
          </div>
        )}
      </SwiperCarousel>
    </>
  );
}

export default GetProducts;
