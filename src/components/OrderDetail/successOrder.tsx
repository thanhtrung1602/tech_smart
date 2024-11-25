import { TbChecklist } from "react-icons/tb";
import { LuPackageCheck, LuPackageOpen, LuPackageX } from "react-icons/lu";
function SuccessOrder({ statusId }: { statusId: number | undefined }) {
  console.log("check statusId", statusId);
  return (
    <div className="flex justify-between mb-6">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-2 border-green-500 rounded-full flex items-center justify-center">
          <TbChecklist size={24} className="text-green-500" />
        </div>
        <span className="mt-2">Đặt hàng</span>
      </div>
      <div className="flex-1 border-t-2 border-green-500 mx-2 mt-6"></div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-2 border-green-500 rounded-full flex items-center justify-center">
          <LuPackageOpen size={24} className="text-green-500" />
        </div>
        <span className="mt-2">Đang xử lý</span>
      </div>
      <div
        className={`flex-1 border-t-2 ${
          statusId === 3
            ? "border-green-500"
            : statusId === 4
            ? "border-red-500"
            : "border-gray-500"
        }  mx-2 mt-6`}
      ></div>
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 border-2 ${
            statusId === 3
              ? "border-green-500"
              : statusId === 4
              ? "border-red-500"
              : "border-gray-500"
          } rounded-full flex items-center justify-center `}
        >
          {statusId === 4 ? (
            <LuPackageX
              size={24}
              className={`${statusId === 4 ? "text-red-500" : "text-gray-500"}`}
            />
          ) : (
            <LuPackageCheck
              size={24}
              className={`${
                statusId === 3 ? "text-green-500" : "text-gray-500"
              }`}
            />
          )}
        </div>

        {statusId === 4 ? (
          <span className="mt-2">Đã Hủy</span>
        ) : (
          <span className="mt-2">Hoàn tất</span>
        )}
      </div>
    </div>
  );
}

export default SuccessOrder;
