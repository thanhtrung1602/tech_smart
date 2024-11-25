import Image from "../Image";
import useGet from "~/hooks/useGet";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useState } from "react";
type ProductImage = {
  id: number;
  productId: number;
  img: string;
};

function ProductImg({ id, img }: { id: number; img: string }) {
  const [idxImage, setIdxImage] = useState<number>(0);

  const { data: images } = useGet<ProductImage[] | undefined>(
    `/productimgs/getAllProductImgByProduct/${id}`
  );

  return (
    <>
      <div className="relative w-full flex justify-center px-10 py-10 bg-white rounded">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 size-8 text-[#6C7275] rounded-full">
          <FaArrowLeft className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <img
          src={images?.[idxImage]?.img || img}
          alt={images?.[idxImage]?.img}
          className="w-full"
          loading="lazy"
        />

        <div className="absolute top-1/2 right-0 -translate-y-1/2 size-8 text-[#6C7275] rounded-full">
          <FaArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
      <div className="w-full flex gap-x-2 justify-center">
        <div className="w-full flex gap-x-2 justify-center">
          {images?.map((image, index) => (
            <div key={image.id}>
              <Image
                src={image.img}
                className={`size-[90px] rounded-md cursor-pointer border p-1 
                  ${idxImage === index ? "border-black" : "border-gray-300"
                  }`}
                onClick={() => setIdxImage(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ProductImg;
