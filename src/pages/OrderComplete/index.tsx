/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import useGet from "~/hooks/useGet";
import { useDelete, usePatch } from "~/hooks/usePost";
import NavCart from "~/layouts/components/NavCart";
import { RootState } from "~/redux/store";
import { toast } from "react-hot-toast";
import Carts from "~/models/Carts";

type Order = {
    id: number;
    phone: number;
    total: number;
    order_code: string;
    createdAt: Date;
    statusId: number;
    paymentMethodId: number;

    statusData: {
        id: number;
        status: string;
    };
    paymentMethods: {
        id: number;
        type: string;
    };
};

function OrderComplete() {
    const queryClient = useQueryClient();
    const userProfile = useSelector((state: RootState) => state.userProfile.userProfile);
    const { data: orderReturn } = useGet<any>(`/orders/getOrderReturn`);
    const [showCancelPopup, setShowCancelPopup] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { mutate: CancelOrder } = usePatch();
    const [cancelReason, setCancelReason] = useState("");
    const [selectedStatusId] = useState<number>(0);
    const { mutate } = useDelete();

    useEffect(() => {
        if (orderReturn?.responseCode === "00") {
            console.log(orderReturn);
        }
    }, [orderReturn?.responseCode]); // Đảm bảo cartRemove thay đổi mới trigger lại useEffect

    const { data: userOrder } = useGet<Order[] | undefined>(
        `/orders/getOrderByIdUser/${userProfile?.id}`
    );
    const openModal = (order: Order) => {
        setSelectedOrder(order);
        setShowCancelPopup(true);
    };


    const filterStatusOrder = userOrder?.filter((status) => {
        const matches = status.statusId === selectedStatusId;
        if (selectedStatusId === 0) {
            return status;
        }
        return matches;
    });

    console.log("id", selectedOrder?.id);
    const handleCancelOrder = () => {
        if (!setCancelReason) {
            toast.error("Vui lòng cung cấp lý do hủy đơn hàng.");
            return;
        }
        CancelOrder({
            url: `/orders/updateOrder/${selectedOrder?.id}`,  // Specify url as a separate property
            data: { statusId: 4, cancelReason: setCancelReason },
        },
            {
                onSuccess: (res) => {
                    if (res.status === 200) {
                        toast.success("Đã hủy đơn hàng thành công");

                        localStorage.removeItem("tempCart");

                        queryClient.invalidateQueries({
                            queryKey: [`/cart/getAllCartByUserId/${userProfile?.id}`],
                        });
                        setSelectedOrder(null);
                        window.location.href = "/orders"
                    }
                },
                onError: (error) => {
                    // Handle error case here if needed
                    toast.error("Không thể hủy đơn hàng, vui lòng thử lại sau.");
                }
            });
    };

    return (
        <>
            {orderReturn?.responseCode === "00" ? (
                // "Hoàn tất đơn hàng" interface shown when payment is successful
                <>
                    <div className="px-40">
                        <div className="w-[600px] mx-auto">
                            <h4 className="text-center text-3xl font-bold py-8">
                                Hoàn tất đơn hàng
                            </h4>
                            <NavCart />
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-10">
                        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                            <h1 className="text-lg font-medium text-gray-500 mb-2">Cảm ơn bạn đã đặt hàng</h1>
                            <h2 className="text-2xl font-semibold mb-6">Đơn đặt hàng của bạn đã đặt thành công</h2>
                            <div className="text-center space-y-2 mb-6">
                                <p className="text-gray-700"><strong>Mã đơn hàng:</strong> {orderReturn?.orderCode}</p>
                                <p className="text-gray-700"><strong>Ngày:</strong> {orderReturn?.formattedOrderDate}</p>
                                <p className="text-gray-700"><strong>Tổng tiền:</strong> <span className="text-red-600 font-semibold">{Number(orderReturn?.amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
                                <p className="text-gray-700"><strong>Phương thức thanh toán:</strong> {orderReturn?.bankCode}</p>
                            </div>
                            <Link to={`/orders`} className="bg-[#202C46] text-white px-6 py-3 rounded-full font-semibold">
                                Lịch sử đơn hàng
                            </Link>
                        </div>
                    </div>
                </>
            ) : (
                // "Xác nhận tiếp tục thanh toán" interface shown when payment is not completed
                <>
                    <div className="px-40">
                        <div className="w-[600px] mx-auto">
                            <h4 className="text-center text-3xl font-bold py-8">
                                Xác nhận tiếp tục thanh toán
                            </h4>
                            <NavCart />
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-10">
                        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                            <h1 className="text-lg font-medium text-gray-500 mb-2">Vui lòng tiếp tục xác nhận đặt hàng</h1>
                            <h2 className="text-2xl font-semibold mb-6">Vui lòng xác nhận tiếp tục thanh toán</h2>
                            <div className="text-center space-y-2 mb-6">
                                <p className="text-gray-700"><strong>Mã đơn hàng:</strong> {orderReturn?.orderCode}</p>
                                <p className="text-gray-700"><strong>Ngày:</strong> {orderReturn?.formattedOrderDate}</p>
                                <p className="text-gray-700"><strong>Tổng tiền:</strong> <span className="text-red-600 font-semibold">{Number(orderReturn?.amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
                                <p className="text-gray-700"><strong>Phương thức thanh toán:</strong> {orderReturn?.bankCode}</p>
                            </div>
                            <div className="flex justify-center gap-4">

{/* <<<<<<< HEAD
                                <button className="bg-[#202C46] text-white px-6 py-3 rounded-full font-semibold">
                                    Tiếp tục thanh toán
                                </button>
                                {filterStatusOrder && filterStatusOrder[0] && (
                                    <td className="px-4 py-2 text-center" key={filterStatusOrder[0].id}>
                                        <button
                                            className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold"
                                            onClick={() => openModal(filterStatusOrder[0])}
                                        >
                                            Hủy đơn hàng
                                        </button>
                                    </td>
                                )}
======= */}
                                
                                <Link to={`/orders`} className="bg-[#202C46] text-white px-6 py-3 rounded-full font-semibold">
                                    Lịch sử đơn hàng
                                </Link>
                                {/* <button
                                    className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold"
                                    onClick={() => setShowCancelPopup(true)}
                                >
                                    Hủy đơn hàng
                                </button> */}
                            </div>
                            {showCancelPopup && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
                                                className="bg-gray-300 px-4 py-2 rounded-full"
                                                onClick={() => setShowCancelPopup(false)}
                                            >
                                                Đóng
                                            </button>
                                            <button className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold"
                                                onClick={handleCancelOrder}>
                                                Xác nhận hủy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default OrderComplete;
