import { useState } from "react";
import { Modal } from "@mui/material";
import Image from "~/components/Image";
import { usePatch } from "~/hooks/usePost";
import { useQueryClient } from "@tanstack/react-query";
import useGet from "~/hooks/useGet";
import { useParams } from "react-router-dom";
import handleBank from "~/services/bank";
import toast from "react-hot-toast";
import OrdersDetail from "~/models/Ordersdetail";
import Orders from "~/models/Orders";

export default function ProductInfor() {
  const { id } = useParams();
  const { mutate: CancelOrder } = usePatch();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState("");
  const [open, setOpen] = useState(false);

  const [selectedPaymentMethod] = useState<number | null>(1);

  const { data: orderDetails } = useGet<OrdersDetail[]>(
    `/orderdetails/getAllOrderDetailByOrderId/${id}`,
    {
      enabled: !!id,
    }
  );

  const { data: orderById } = useGet<Orders>(`/orders/getOrderById/${id}`, {
    enabled: !!id,
  });

  const handlePayment = async () => {
    if (orderById) {
      if (selectedPaymentMethod === 1) {
        const result = await handleBank.bank(orderById.total, orderById.id);
        window.location.href = result.data.url;
        return;
      }
    }
  };

  const handleCancelOrder = () => {
    if (!cancelReason) {
      toast.error("Vui lòng cung cấp lý do hủy đơn hàng.");
      return;
    }
    CancelOrder(
      {
        url: `/orders/updateOrder/${id}`, // Specify url as a separate property
        data: { statusId: 4, reason: cancelReason },
      },
      {
        onSuccess: (res) => {
          if (res.status === 200) {
            toast.success("Đã hủy đơn hàng thành công");
            queryClient.invalidateQueries({
              queryKey: [`/orderdetails/getAllOrderDetailByOrderId/${id}`],
            });
            window.location.reload();
          }
        },
      }
    );
  };
  return (
    <div className="bg-white pt-6 px-6 mt-2 rounded-lg  w-full">
      <table className="w-full border-collapse table-auto">
        <thead>
          <tr className="border-b-2">
            <th className="text-xl px-4 py-2 text-left whitespace-nowrap">
              Danh sách sản phẩm
            </th>
          </tr>
        </thead>
        <tbody>
          {orderDetails &&
            orderDetails.map((detail) => (
              <tr key={detail.id} className="border-b">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    {/* Hiển thị hình ảnh */}
                    <div
                      className="w-16 h-16 flex-shrink-0 mr-4"
                      style={{ minWidth: "64px" }}
                    >
                      <Image
                        alt={detail.productData.name}
                        src={detail.productData.img}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    {/* Hiển thị thông tin */}
                    <div>
                      <p className="text-sm font-medium">
                        {detail.productData.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Số lượng: {detail.quantity} <br />
                        {detail.color && (
                          <>
                            Màu sắc: {detail.color} <br />
                          </>
                        )}
                        {detail.size && <>Dung lượng: {detail.size}</>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-sm font-medium">
                  {detail.total.toLocaleString()}đ
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="flex justify-end gap-4 m-4">
        {orderById?.statusPayId === 1 && orderById?.statusId !== 4 ? (
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-md bg-red-500 text-white  hover:bg-red-600"
          >
            Huỷ đơn
          </button>
        ) : null}

        {/* Cancellation reason modal */}
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] text-center">
              <h3 className="text-xl font-semibold mb-4">Lý do hủy đơn hàng</h3>
              <div className="text-left mb-4">
                <label className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="Khách không mua nữa"
                    checked={cancelReason === "Khách không mua nữa"}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="mr-2"
                  />
                  Khách không mua nữa
                </label>
                <label className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="Đặt nhầm sản phẩm"
                    checked={cancelReason === "Đặt nhầm sản phẩm"}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="mr-2"
                  />
                  Đặt nhầm sản phẩm
                </label>
                <label className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="Đơn trùng"
                    checked={cancelReason === "Đơn trùng"}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="mr-2"
                  />
                  Đơn trùng
                </label>
                <label className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="Không muốn chuyển khoản"
                    checked={cancelReason === "Không muốn chuyển khoản"}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="mr-2"
                  />
                  Không muốn chuyển khoản
                </label>
                <label className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="Lý do khác"
                    checked={cancelReason === "Lý do khác"}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="mr-2"
                  />
                  Lý do khác
                </label>
                <textarea
                  className="w-full p-2 border rounded-lg mt-2"
                  placeholder="Vui lòng nhập lý do khác nếu có..."
                  rows={4}
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-300 px-4 py-2 rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  Đóng
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
                  onClick={handleCancelOrder}
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </Modal>
        {orderById?.statusPayId === 1 &&
        orderById?.paymentMethodId !== 2 &&
        orderById?.statusId !== 4 ? (
          <button
            onClick={handlePayment}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
          >
            Tiếp tục thanh toán
          </button>
        ) : null}
      </div>
    </div>
  );
}
