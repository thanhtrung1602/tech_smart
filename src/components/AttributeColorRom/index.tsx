import Products from "~/models/Products";
import ValueAttribute from "~/models/ValueAttribute";
import Image from "../Image";
import { parseCapacityValue } from "../ConvertRom";

interface AttributeColorRom {
    attributeValue: ValueAttribute[],
    productDetail: Products,
    slugCategory: string
    colors: number,
    capacity: number,
    handleColorChange: (id: number) => void,
    handleCapacityChange: (id: number) => void
}

function AttributeColorRom({ attributeValue, productDetail, slugCategory, colors, capacity, handleColorChange, handleCapacityChange }: AttributeColorRom) {
    return (
        <>
            {attributeValue && attributeValue.length > 0 && (
                <>
                    {slugCategory === "dien-thoai" ||
                        slugCategory === "tablet" ? (
                        // Trường hợp cho điện thoại và tablet: Hiển thị một hàng màu sắc và dung lượng
                        <div className="pt-3 pb-4 flex flex-col gap-4">
                            {/* Nhãn cho Màu sắc */}
                            <ColorProduct
                                attributeValue={attributeValue}
                                productDetail={productDetail}
                                handleColorChange={handleColorChange}
                                colors={colors}
                            />

                            {/* Nhãn cho Dung lượng */}
                            <CapacityProduct
                                attributeValue={attributeValue}
                                handleCapacityChange={handleCapacityChange}
                                capacity={capacity}
                            />
                        </div>
                    ) : (
                        // Trường hợp cho laptop: Hiển thị một hàng màu sắc duy nhất từ attributeValue
                        <div className="pt-3 pb-4">
                            {/* Nhãn cho Màu sắc */}
                            <ColorProduct
                                attributeValue={attributeValue}
                                productDetail={productDetail}
                                handleColorChange={handleColorChange}
                                colors={colors}
                            />
                        </div>
                    )}
                </>
            )}
        </>
    );
}

export default AttributeColorRom;

function ColorProduct({ attributeValue, productDetail, handleColorChange, colors }: { attributeValue: ValueAttribute[], productDetail: Products, handleColorChange: (id: number) => void, colors: number }) {
    return (
        <>
            <div className="flex items-center gap-2">
                <span className="font-semibold">Màu sắc:</span>
            </div>
            {/* Hiển thị tất cả màu sắc */}
            <div className="flex flex-wrap gap-2">
                {attributeValue.map((item) => {
                    if (item.attributeData.id === 4 || item.attributeData.id === 29) {
                        return (
                            <button
                                key={item.id}
                                className={`relative overflow-hidden flex items-center gap-x-3 p-2 ${colors === item.id
                                    ? "border-[#ff3737] before:absolute before:-right-5 before:top-0 before:size-7 before:bg-[#ff3737] before:content-[''] before:transform before:rotate-45 before:origin-top-right after:absolute after:right-1 after:top-0 after:translate-x-[2px] after:-translate-y-[2px] after:text-white after:content-['✔'] after:text-[10px]"
                                    : "border-[#b8b8b8]"
                                    } border-[2px] rounded`}
                                onClick={() => handleColorChange(item.id)}
                            >
                                <Image
                                    src={productDetail.img}
                                    fallbackSrc=""
                                    alt=""
                                    className="size-8 rounded"
                                />
                                <span className="text-sm font-medium">
                                    {item.value}
                                </span>
                            </button>
                        );
                    }
                    return null;
                })}
            </div>
        </>
    );
}

function CapacityProduct({ attributeValue, handleCapacityChange, capacity }: { attributeValue: ValueAttribute[], handleCapacityChange: (id: number) => void, capacity: number }) {
    const capacities = attributeValue.filter((item) => item.attributeData.id === 6);

    const sortedRom = capacities.sort((a, b) => {
        const capacityA = parseCapacityValue(a.value);
        const capacityB = parseCapacityValue(b.value);
        return capacityA - capacityB;
    })

    // Nếu không có capacity đã chọn, mặc định chọn phần tử đầu tiên
    const selectedCapacity = capacity || sortedRom[0]?.id;

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="font-semibold">Dung lượng:</span>
            </div>
            {/* Hiển thị tất cả dung lượng */}
            <div className="flex flex-wrap gap-2">
                {sortedRom.map((item) => {
                    return (
                        <button
                            key={item.id}
                            className={`relative overflow-hidden flex items-center gap-x-3 p-2 ${selectedCapacity === item.id
                                ? "border-[#ff3737] before:absolute before:-right-5 before:top-0 before:size-7 before:bg-[#ff3737] before:content-[''] before:transform before:rotate-45 before:origin-top-right after:absolute after:right-1 after:top-0 after:translate-x-[2px] after:-translate-y-[2px] after:text-white after:content-['✔'] after:text-[10px]"
                                : "border-[#b8b8b8]"
                                } border-[2px] rounded`}
                            onClick={() => handleCapacityChange(item.id)}
                        >
                            <span className="text-sm font-medium">{item.value}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}



