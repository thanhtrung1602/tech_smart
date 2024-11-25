/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import useGet from "~/hooks/useGet";
import Image from "~/components/Image";
import emptyProduct from "~/assets/images/empty_product.png";

import Products from "~/models/Products";
import Categories from "~/models/Categories";
import GetProducts from "~/features/getProducts";

import { Link, useParams } from "react-router-dom";
import { IoFilter } from "react-icons/io5";
import PaginationList from "~/components/PaginationList";
import currencyFormat from "~/components/CurrencyFormat";
import Manufacturer from "~/models/Manufacturer";
import BannerCategory, {
  CategoryType,
} from "~/layouts/components/BannerCategory";

function Category() {
  const { slug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedManufacturer, setSelectedManufacturer] = useState<{
    id: number;
    slug: string;
  }>({ id: 0, slug: "" });
  const [selectedPrice, setSelectedPrice] = useState<{
    minPrice: number;
    maxPrice: number;
  }>({ minPrice: 0, maxPrice: 999999999999999 });
  const [totalProducts, setTotalProducts] = useState<number>(0);

  //Set chuỗi api dựa trên option của select để hiện sản phẩm tương ứng theo thẻ select
  const urlSelected = () => {
    if (selectedManufacturer.slug === null || selectedManufacturer.id === 0) {
      return `/products/getProductCategory/${slug}?page=${currentPage}&size=${itemsPerPage}&minPrice=${selectedPrice.minPrice}&maxPrice=${selectedPrice.maxPrice}`;
    } else {
      return `/products/getProductOfManufacturerCategoryAndPrice/${slug}/${selectedManufacturer.slug}?page=${currentPage}&size=${itemsPerPage}&minPrice=${selectedPrice.minPrice}&maxPrice=${selectedPrice.maxPrice}`;
    }
  };

  //Set chuỗi api dựa trên option của select để xác định tổng sản phẩm và phân trang
  const urlPagination = () => {
    if (selectedManufacturer.slug === null || selectedManufacturer.id === 0) {
      return `/products/getProductAllCategory/${slug}?minPrice=${selectedPrice.minPrice}&maxPrice=${selectedPrice.maxPrice}`;
    } else {
      return `/products/getProductByManufacturer/${selectedManufacturer.id}?page=${currentPage}&size=${itemsPerPage}&minPrice=${selectedPrice.minPrice}&maxPrice=${selectedPrice.maxPrice}`;
    }
  };


  const { data: category } = useGet<Categories>(
    `/categories/getCategorySlug/${slug}`
  );


  const { data: manufacturers } = useGet<Manufacturer[]>(
    `/manufacturer/getManufacturerByCategory/${slug}`
  );

  const { data: productOfManufacturerCategoryAndPrice } = useGet<{
    count: number;
    rows: Products[];
  }>(urlSelected());

  const { data: productsPagination } = useGet<{
    count: number;
    rows: Products[];
  }>(urlPagination());

  console.log(productOfManufacturerCategoryAndPrice, productsPagination);

  //Set lại tổng sản phẩm để phân trang
  useEffect(() => {
    if (productsPagination) {
      return setTotalProducts(productsPagination.count);
    }
  }, [productsPagination]);

  //Set lại curren page khi slug và các selected thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [slug, selectedManufacturer]);

  //Set price về lại mặc định khi slug thay đổi
  useEffect(() => {
    setSelectedPrice({ minPrice: 0, maxPrice: 999999999999999 });
  }, [slug]);

  // Handle page click
  const handlePageClick = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  // Handle category change
  const handleManufacturerChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const manufacturerId = Number(event.target.value);
    setSelectedManufacturer(
      manufacturers?.find(
        (manufacturer) => manufacturer.id === manufacturerId
      ) || { id: 0, slug: "" }
    );
  };

  // Handle price change
  const handlePriceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const price = event.target.value.split("-"); //Cắt chuỗi thành mảng
    const [min, max] = price; //Áp dụng destructuring để lấy 2 phần tử trong mảng
    setSelectedPrice({ minPrice: parseInt(min), maxPrice: parseInt(max) });
  };

  return (
    <>
      <div className="px-40 w-full">
        <h1 className="pt-4 mb-3 text-3xl font-bold">
          {category?.name}
        </h1>
        {category &&
          <BannerCategory category={category?.id as CategoryType} />
        }
      </div>
      <div className="px-40 py-5 grid grid-cols-4 gap-x-5">
        {/* Sidebar filters */}
        <div className="sticky top-[92px] h-[85vh] col-span-1 bg-white rounded p-4">
          <div className="flex items-center gap-x-2 py-2 mb-2 border-b-2">
            <IoFilter className="text-xl" />
            <h2 className="text-lg font-semibold">Bộ lọc</h2>
          </div>
          <form className="flex flex-col gap-y-6">
            <div>
              <label
                htmlFor="manufacturer"
                className="block text-gray-500 font-medium mb-2"
              >
                Hãng sản xuất
              </label>
              <select
                id="manufacturer"
                value={selectedManufacturer.id || ""}
                onChange={handleManufacturerChange}
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              >
                <option value="">Tất cả</option>
                {manufacturers?.map((manufacturer) => (
                  <option key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-gray-500 font-medium mb-2"
              >
                Mức giá
              </label>
              <select
                id="price"
                value={`${selectedPrice.minPrice} - ${selectedPrice.maxPrice}`}
                name="price"
                onChange={handlePriceChange}
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              >
                <option value="0-999999999999999">Tất cả</option>
                <option value="1 - 2000000">Dưới 2 triệu</option>
                <option value="2000000 - 4000000">Từ 2 - 4 triệu</option>
                <option value="4000000 - 8000000">Từ 4 - 8 triệu</option>
                <option value="8000000 - 10000000">Từ 8 - 10 triệu</option>
                <option value="10000000 - 20000000">Từ 10 - 20 triệu</option>
                <option value="20000000 - 999999999999999">
                  Trên 20 triệu
                </option>
              </select>
            </div>
          </form>
        </div>

        {/* Products */}
        <div className="col-span-3">
          {productOfManufacturerCategoryAndPrice ? (
            <div className="grid grid-cols-4 gap-2">
              {productOfManufacturerCategoryAndPrice.rows.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col justify-between gap-y-2 relative h-[360px] p-5 rounded bg-white overflow-hidden select-none"
                >
                  <span className="absolute top-0 left-0 rounded-tr-full px-4 text-white text-xs font-semibold py-2 rounded-br-full bg-[#FF0000] z-10">
                    Giảm {product.discount}%
                  </span>
                  <Link
                    to={`/product/${product.categoryData.slug}/${product.slug}`}
                  >
                    <div className="w-full h-48 mb-5 flex justify-center items-center">
                      <Image
                        src={product.img}
                        fallbackSrc=""
                        alt="Image Product"
                        className="w-full my-0 mx-auto"
                      />
                    </div>
                    <p className="line-clamp-2 font-medium text-sm pt-1">
                      {product.name}
                    </p>
                  </Link>
                  <div className="flex flex-col">
                    <span className="font-normal text-sm text-[#6C7275] line-through">
                      {currencyFormat({
                        paramFirst: product.price,
                        paramSecond: product.discount,
                      })}
                      đ
                    </span>
                    <span className="font-semibold text-base text-[#FF0000]">
                      {product.price.toLocaleString()}đ
                    </span>
                    <span className="text-xs text-[#4ca77c]">
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
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Image src={emptyProduct} alt="Empty Product"></Image>
              <p className="text-sm text-gray-500">
                Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp.
              </p>
            </div>
          )}

          {/* Pagination controls */}
          {totalProducts
            ? productsPagination &&
            productOfManufacturerCategoryAndPrice && (
              <PaginationList
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalProducts={totalProducts}
                handlePageClick={handlePageClick}
              />
            )
            : ""}
        </div>
      </div>
    </>
  );
}

export default Category;
