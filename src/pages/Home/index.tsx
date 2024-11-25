/* eslint-disable @typescript-eslint/no-unused-vars */
import Banner from "~/layouts/components/Banner";
import Nav from "~/layouts/components/Nav";
import bannerProductPopular from "~/assets/images/bannerProductPopular.png";

import SwiperItem from "~/components/Swiper";
import Products from "~/models/Products";
import useGet from "~/hooks/useGet";

import GetProducts from "~/features/getProducts";
import Image from "~/components/Image";
import useBlog from "~/hooks/useBlog";
import { Link } from "react-router-dom";
import Blog from "~/models/Blog";
import BlogChildren from "~/components/Blog/BlogComponent/BigBlog/BigBlog";

function Home() {
  const { data: blogs } = useBlog<Blog[] | undefined>(`/posts`);

  const { data: products } = useGet<Products[]>("/products/findAll");
  const { data: products1 } = useGet<{ total: number, rows: Products[] }>("/products/getAllProducts?page=1&size=20");
  const { data: products2 } = useGet<{ total: number, rows: Products[] }>("/products/getAllProducts?page=2&size=20");
  const {
    data: computerProducts,
  } = useGet<{ rows: Products[] }>("products/getProductAllCategory/man-hinh");

  const { data: earphoneProducts } = useGet<{ rows: Products[] }>(
    "products/getProductAllCategory/tai-nghe"
  );

  const { data: lapProducts } = useGet<{ rows: Products[] }>(
    "products/getProductAllCategory/tai-nghe"
  );

  const hotProductsPage1 = products?.filter((product) => product.hot > 50);

  return (
    <>
      {/* Banner */}
      <Banner />
      {/* Menu */}
      <Nav />
      {/* Sản phẩm hot */}
      <section className="px-4 my-3 md:px-40 md:py-2">
        <div className="flex flex-col  w-full">
          <div className="mb-2 text-left border-b-2 border-[#eb3e32] flex items-center justify-between ">
            <h2 className="text-[24px] bg-[#eb3e32] text-white rounded-t-md py-[2px] px-3 inline-block">
              SẢN PHẨM HOT
            </h2>
          </div>

          <div className="flex gap-x-2 bg-[#ed4f2e] p-3 rounded shadow-lg overflow-hidden border-x">
            <Image
              src="https://vmart.exdomain.net/image/cache/catalog/vmart/banner/banner_1_tab_2-285x312.png"
              alt=""
              className="size-full object-cover rounded-lg"
            />
            <div className="w-4/5 rounded-lg shadow-xl">
              <GetProducts
                products={hotProductsPage1 ?? []}
                breakpoints={{
                  320: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
                spaceBetween={10}
                pagination={true}
                navigation={true}
                className="relative group h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sale giảm giá có hạn */}
      {/* <section className="flex flex-col md:flex-row bg-white">
        <div className="w-full md:w-1/2 select-none">
          <Image src={bannerSale} alt="" className="w-full" />
        </div>
        <div className="w-full md:w-1/2 md:pl-20 py-10 md:py-24">
          <div className="flex flex-col gap-y-4 mb-6">
            <span className="text-base font-bold">Limited Edition</span>
            <h2 className="text-[#7D8184] text-4xl font-medium">
              Hurry up! 30% OFF
            </h2>
            <span className="text-xl text-[#7D8184]">
              Find clubs that are right for your game
            </span>
          </div>
          <div className="flex flex-col gap-y-4 mb-6">
            <span className="text-base font-normal">Offer expires in:</span>
            <Countdown targetDate={saleEndDate} />
          </div>
          <button
            type="button"
            className="px-10 py-2 text-white bg-main500 rounded"
          >
            Shop Now
          </button>
        </div>
      </section> */}
      {/* Sản phẩm phổ biến */}
      <section className="px-4 md:px-40">
        <div className="flex flex-col md:flex-row items-center gap-x-5">
          <div className="w-full md:w-3/5">
            <div className="border-b-2 border-[#eb3e32]">
              <h2 className="text-[24px] bg-[#eb3e32] text-white rounded-t-md py-[2px] px-3 inline-block">
                Sản phẩm phổ biến
              </h2>
            </div>
            <GetProducts
              products={products1?.rows ?? []}
              breakpoints={{
                320: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 3 },
              }}
              spaceBetween={20}
              pagination={true}
              navigation={true}
              className="relative group mb-5 pr-3 pt-3 h-96"
            />
            <GetProducts
              products={products2?.rows ?? []}
              breakpoints={{
                320: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 3 },
              }}
              spaceBetween={20}
              pagination={true}
              navigation={true}
              className="relative group pr-3 h-96"
            />
          </div>
          <div className="w-full h-[850px] md:w-2/5 select-none">
            <Image
              src={bannerProductPopular}
              alt=""
              className="block w-full h-[820px]"
            />
          </div>
        </div>
        {/* <div className="flex items-center my-4">
          <iframe
            className="rounded-lg"
            width="640"
            height="330"
            src="https://www.youtube.com/embed/enh6Mvce__s?autoplay=1&mute=1&loop=1&playlist=enh6Mvce__s"
            title="Giới thiệu iPhone 16 Pro | Apple"
            frameBorder="0"
            style={{ border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
          <div className="w-3/5">
            <GetProducts
              products={products ?? []}
              breakpoints={{
                320: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 3 },
              }}
              spaceBetween={10}
              pagination={true}
              navigation={true}
              className="relative group pl-3 h-[23rem]"
            />
          </div>
      </div> */}
      </section >

      <section className="px-4 my-3 md:px-40 md:py-2">
        <div className="flex flex-col  w-full">
          <div className="mb-2 text-left border-b-2 border-[#eb3e32] flex items-center justify-between ">
            <h2 className="text-[24px] bg-[#eb3e32] text-white rounded-t-md py-[2px] px-3 inline-block">
              LAPTOP
            </h2>
            <div className="flex space-x-3 ml-4 ">
              <Link
                to={`/laptop`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Laptop
              </Link>
              <Link
                to={`/laptop/asus`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Laptop Asus
              </Link>
              <Link
                to={`/laptop/acer`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Laptop Acer
              </Link>
              <Link
                to={`/laptop/dell`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Laptop Dell
              </Link>
            </div>
          </div>
          <div className="flex gap-x-2 bg-[#dd0101] p-3 rounded shadow-lg overflow-hidden border-x">
            <Image
              src="https://www.phucanh.vn/media/news/1508_Postfacebook-Giasinhvien.png"
              alt=""
              className="size-full object-cover"
            />
            <div className="w-3/5 rounded-lg shadow-xl">
              <GetProducts
                products={lapProducts?.rows ?? []}
                breakpoints={{
                  320: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 3 },
                }}
                spaceBetween={10}
                pagination={true}
                navigation={true}
                className="relative group h-96"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 my-3 md:px-40 md:py-2">
        <div className="flex flex-col w-full">
          <div className="mb-2 text-left border-b-2 border-[#eb3e32] flex items-center justify-between ">
            <h2 className="text-[24px] bg-[#eb3e32] text-white rounded-t-md py-[2px] px-3 inline-block">
              MÀN HÌNH
            </h2>
            <div className="flex space-x-3 ml-4 ">
              <Link
                to={`/man-hinh`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Màn hình
              </Link>
              <Link
                to={`/man-hinh/asus`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Màn hình Asus
              </Link>
              <Link
                to={`/man-hinh/apple`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Màn hình Apple
              </Link>
              <Link
                to={`/man-hinh/samsung`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Màn hình Samsung
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-x-2 overflow-hidden">
            <div className="w-2/5">
              <Image
                src="https://vmart.exdomain.net/image/cache/catalog/vmart/banner/banner_tab_1_1-280x374.png"
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div className="w-[75%] h-full">
              <GetProducts
                products={computerProducts?.rows ?? []}
                breakpoints={{
                  320: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
                spaceBetween={10}
                pagination={true}
                navigation={true}
                className="relative group h-96"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 my-3 md:px-40 md:py-2">
        <div className="flex flex-col  w-full">
          <div className="mb-2 text-left border-b-2 border-[#eb3e32] flex items-center justify-between ">
            <h2 className="text-[24px] bg-[#eb3e32] text-white rounded-t-md py-[2px] px-3 inline-block">
              TAI NGHE
            </h2>
            <div className="flex space-x-3 ml-4 ">
              <Link
                to={`/tai-nghe`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Tai nghe
              </Link>
              <Link
                to={`/tai-nghe/samsung`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Tai nghe Samsung
              </Link>
              <Link
                to={`/tai-nghe/xiaomi`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Tai nghe Xiaomi
              </Link>
              <Link
                to={`/tai-nghe/asus`}
                className="text-sm font-semibold text-black px-2 py-1 hover:bg-gray-100 hover:text-[#eb3e32]"
              >
                Tai nghe Asus
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-x-2 p-3 rounded shadow-lg overflow-hidden border-x bg-[#0b1521]">
            <Image
              src="https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lwtg7sihvavv2c"
              alt=""
              className="size-full h-[23rem] object-cover"
            />
            <div className="w-[75%] rounded-lg shadow-xl">
              <GetProducts
                products={earphoneProducts?.rows ?? []}
                breakpoints={{
                  320: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
                spaceBetween={10}
                pagination={true}
                navigation={true}
                className="relative group h-[23rem]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="px-4 md:px-40 py-10">
        <div className="flex flex-col w-full">
          <div className="mb-2 text-left border-b-2 border-[#eb3e32] flex items-center justify-between">
            <h2 className="text-[24px] bg-[#eb3e32] text-white rounded-t-md py-[2px] px-3 inline-block">
              Blog
            </h2>
          </div>
          <div className="flex items-center gap-x-2 rounded overflow-hidden">
            <SwiperItem
              items={blogs}
              className="relative group"
              breakpoints={{
                // Mobile
                320: {
                  slidesPerView: 1,
                },
                // Tablet
                768: {
                  slidesPerView: 2,
                },
                // Laptop
                1024: {
                  slidesPerView: 3,
                },
              }}
              spaceBetween={20}
              navigation={false}
              pagination={true}
            >
              {(blog) => (
                <BlogChildren
                  key={blog.id} // Add unique key for each item
                  title={blog.title.rendered}
                  featured_media={blog.featured_media}
                  slug={blog.slug}
                />
              )}
            </SwiperItem>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
