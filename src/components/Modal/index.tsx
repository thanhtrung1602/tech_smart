import { useState, useEffect } from "react";
import logo1 from "~/assets/images/logo2.png";

interface ModalProps {
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
    onClose: () => void;
}

function Modal({ isOpen, message, type, onClose }: ModalProps) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true); // Hiển thị modal khi mở
        } else {
            setTimeout(() => setShouldRender(false), 300); // Loại bỏ modal sau khi hiệu ứng thoát hoàn tất
        }
    }, [isOpen]);

    const handleClose = () => {
        onClose();
    };

    const getTextColor = () => {
        switch (type) {
            case "success":
                return "text-green-700";
            case "error":
                return "text-red-700";
            case "warning":
                return "text-yellow-700";
            case "info":
                return "text-blue-700";
            default:
                return "text-gray-700";
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 
                 ${isOpen ? "transition-opacity duration-300 opacity-100" : "transition-opacity duration-300 opacity-0"}`}
        >
            <div
                className={`relative w-full max-w-md 
                    ${isOpen ? "transition-transform duration-300 transform scale-100" : "transition-transform duration-300 transform scale-95"}`}
            >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header với logo cố định và tiêu đề */}
                    <div className="p-4 flex items-center border-b border-gray-200">
                        <div className="flex items-center">
                            <img
                                src={logo1} // Thay bằng đường dẫn logo của bạn
                                alt="Shop Logo"
                                className="w-1/5 mr-2"
                            />
                            <h2 className="text-[#eb3e32] text-base hidden md:flex font-bold">
                                TechSmart
                            </h2>
                        </div>
                    </div>

                    {/* Nội dung thông báo */}
                    <div className="p-4">
                        <p className={`${getTextColor()} text-lg font-medium`}>
                            {message}
                        </p>
                    </div>

                    {/* Nút đóng */}
                    <div className="px-4 py-3 bg-gray-50 text-right">
                        <button
                            onClick={handleClose}
                            type="button"
                            className="py-2 px-4 bg-[#eb3e32] outline-none hover:bg-[#eb3e32c3] text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none rounded-lg"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;
