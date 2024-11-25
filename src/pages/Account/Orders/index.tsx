/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useSelector } from "react-redux";
import useGet from "~/hooks/useGet";
import { RootState } from "~/redux/store";
import { Link } from "react-router-dom";

type Order = {
  id: number;
  phone: number;
  total: number;
  order_code: string;
  createdAt: Date;
  statusId: number;
  paymentMethodId: number;
  transactionCode: number;
  tracking_order: string;
  statusData: {
    id: number;
    status: string;
  };
  paymentMethods: {
    id: number;
    type: string;
  };
};

type StatusOrder = {
  id: number;
  status: string;
};

function Orders() {
  const [selectedStatus, setSelectedStatus] = useState<string>("Tất cả");
  const [selectedStatusId, setSelectedStatusId] = useState<number>(0);

  const userProfile = useSelector(
    (state: RootState) => state.userProfile.userProfile
  );

  const { data: userOrder } = useGet<Order[]>(
    `/orders/getOrderByIdUser/${userProfile?.id}`
  );

  const { data: statusOrders } = useGet<StatusOrder[]>(
    "/status/findAllStatusOrder/"
  );
  //Selected Status của order
  const handleButtonClick = (status: string, id: number) => {
    setSelectedStatus(status);
    setSelectedStatusId(id);
  };

  const filterStatusOrder = userOrder?.filter((status) => {
    const matches = status.statusId === selectedStatusId;
    if (selectedStatusId === 0) {
      return status;
    }
    return matches;
  });

  return (
    <>
      <div className="mb-5">
        <h2 className="font-bold text-2xl">Lịch sử đơn hàng</h2>
      </div>
      <div className="mb-3">
        <button
          onClick={() => handleButtonClick("Tất cả", 0)}
          className={`px-4 py-2 mr-2 rounded-md border ${
            selectedStatus === "Tất cả"
              ? "bg-[#eb3e32] text-white"
              : " hover:bg-[#eb3e32] hover:text-white duration-200 ease-in-out"
          }`}
        >
          Tất cả
        </button>
        {statusOrders?.map((s) => (
          <button
            key={s.status}
            onClick={() => handleButtonClick(s.status, s.id)}
            className={`px-4 py-2 mr-2.5 rounded-md border ${
              selectedStatus === s.status
                ? "bg-[#eb3e32] text-white"
                : " hover:bg-[#eb3e32] hover:text-white duration-200 ease-in-out"
            }`}
          >
            {s.status}
          </button>
        ))}
      </div>
      <div className="scrollbar">
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-white">
            <tr className="border-b-2 text-sm font-thin">
              <th className="px-4 py-2 text-center sticky top-0 bg-white text-black w-1/6">
                ID
              </th>
              <th className="px-4 py-2 text-center sticky top-0 bg-white text-black w-1/6">
                Ngày đặt
              </th>
              <th className="px-4 py-2 text-center sticky top-0 bg-white text-black w-1/6">
                Trạng thái
              </th>
              <th className="px-4 py-2 text-center sticky top-0 bg-white text-black w-1/6">
                Giá
              </th>
              <th className="px-4 py-2 text-center sticky top-0 bg-white text-black w-1/6">
                Phương thức thanh toán
              </th>
              <th className="px-4 py-2 text-center sticky top-0 bg-white text-black w-1/6">
                Chi tiết
              </th>
            </tr>
          </thead>
          <tbody>
            {filterStatusOrder?.map((order) => {
              const date = new Date(order.createdAt);
              const formatDate = new Intl.DateTimeFormat("vi-VN").format(date);
              return (
                <tr key={order.id} className="border-b-2 text-[14px]">
                  <td className="px-4 py-2 text-center">{order.order_code}</td>
                  <td className="px-4 py-2 text-center">{formatDate}</td>
                  <td
                    className={`px-4 py-2 text-center ${getStatusColor(
                      order.statusData.status
                    )}`}
                  >
                    {order.statusData.status}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {order.total.toLocaleString()}đ
                  </td>
                  <td className="px-4 py-2 text-center text-sm">
                    {order?.paymentMethods?.type}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Link to={`/orders/detail/${order.id}`}>
                      <button className=" px-2 py-1 rounded-md bg-[#eb3e32] text-white hover:bg-[#c7342b] duration-200">
                        Chi tiết
                      </button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Đang xử lý":
      return `text-sky-600 `;
    case "Chưa thanh toán":
      return "text-orange-600";
    case "Đã thanh toán":
      return "text-teal-600 ";
    case "Đã huỷ":
      return "text-red-600 ";
    case "Trả hàng/Hoàn tiền":
      return "text-green-600 ";
    default:
      return "text-gray-600 ";
  }
}

export default Orders;
