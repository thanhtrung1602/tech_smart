/* eslint-disable @typescript-eslint/no-unused-vars */
import { CiDeliveryTruck, CiMoneyBill, CiLock, CiPhone, CiInstagram, CiFacebook, CiYoutube } from "react-icons/ci";
import americanexpress from "~/assets/images/americanexpress.png";
import mastercard from "~/assets/images/mastercard.png";
import paypal from "~/assets/images/paypal.png";
import visa from "~/assets/images/visa.png";
import pay from "~/assets/images/pay.png";
import stripe from "~/assets/images/stripe.png";
import Image from "~/components/Image";

function Footer() {
    return (
        <footer>
            <div className="w-full px-40 flex justify-center gap-x-7 bg-[#f3f4f6]">
                <div className="px-8 py-12 w-[262px]">
                    <CiDeliveryTruck className="size-12" />
                    <p className="text-xl font-medium w-full">Miễn phí giao hàng</p>
                    <span className="text-sm">Cho đơn trên 4.000.000đ</span>
                </div>
                <div className="px-8 py-12 w-[262px]">
                    <CiMoneyBill className="size-12" />
                    <p className="text-xl font-medium w-full">Trả hàng</p>
                    <span className="text-sm">Đổi trả trong 30 ngày</span>
                </div>
                <div className="px-8 py-12 w-[262px]">
                    <CiLock className="size-12" />
                    <p className="text-xl font-medium w-full">Thanh toán an toàn</p>
                    <span className="text-sm">Bảo đảm bởi Stripe</span>
                </div>
                <div className="px-8 py-12 w-[262px]">
                    <CiPhone className="size-12" />
                    <p className="text-xl font-medium w-full">Hỗ trợ 24/7</p>
                    <span className="text-sm">Số điện thoại và email</span>
                </div>
            </div>
            <div className="bg-[#090D14] px-40 pt-20 pb-8">
                <div className="flex justify-between">
                    <div className="w-[544px] text-white flex flex-col gap-y-8">
                        <h2 className="text-2xl font-semibold">TechSmart</h2>
                        <p className="text-xl">Không chỉ là đồ điện tử<br /> Nó là một cách sống.</p>
                        <div className="flex items-center gap-x-6">
                            <CiInstagram className="size-6" />
                            <CiFacebook className="size-6" />
                            <CiYoutube className="size-6" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-8 text-white w-40">
                        <h2 className="text-xl">Các trang</h2>
                        <div className="flex flex-col gap-y-4">
                            <span>Trang chủ</span>
                            <span>Cửa hàng</span>
                            <span>Liên hệ</span>
                            <span>Bài viết</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-8 text-white w-40">
                        <h2 className="text-xl">Chính sách</h2>
                        <div className="flex flex-col gap-y-4">
                            <span>Chính sách vận chuyển</span>
                            <span>Trả hàng & hoàn tiền</span>
                            <span>Hỗ trợ</span>
                            <span>Hỏi đáp</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-8 text-white w-40">
                        <h2 className="text-xl">Trụ sở</h2>
                        <div className="flex flex-col gap-y-4">
                            <span>Quận 12</span>
                            <span>Hồ Chí Mimh</span>
                            <span>Việt Nam</span>
                            <span>0903153512</span>
                        </div>
                    </div>
                </div>
                <div className="pt-16 flex justify-between text-white">
                    <div className="flex">
                        <p className="pr-4">Bản quyền © 2023 3legant. Bảo lưu mọi quyền.</p>
                        <p className="px-4 border-l-[0.5px] text-[#6C7275]">Chính Sách Bảo Mật</p>
                        <p className="text-[#6C7275]">Điều Khoản & Điều Kiện</p>
                    </div>
                    <div className="flex gap-x-2">
                        <Image src={visa} alt="" />
                        <Image src={americanexpress} alt="" />
                        <Image src={mastercard} alt="" />
                        <Image src={stripe} alt="" />
                        <Image src={paypal} alt="" />
                        <Image src={pay} alt="" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;