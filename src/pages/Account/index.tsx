import { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePatch } from "~/hooks/usePost";
import { RootState } from "~/redux/store";
import { setUserProfile } from "~/redux/userProfileSlice";

function Account() {
  const userProfile = useSelector(
    (state: RootState) => state.userProfile.userProfile
  );
  const [fullname, setFullName] = useState<string>(userProfile?.fullname || "");
  const [phone, setPhone] = useState<string>(String(userProfile?.phone) || "");
  const [email, setEmail] = useState<string>(userProfile?.email || "");
  const { mutate } = usePatch();
  const dispatch = useDispatch();

  const handleUpdateProfile = (e: FormEvent) => {
    e.preventDefault();
    const data = {
      fullname,
      phone,
      email,
    };
    mutate(
      { url: `/users/updateUser/${userProfile?.id}`, data },
      {
        onSuccess: (res) => {
          if (res.status === 200) {
            dispatch(setUserProfile(res.data));
          }
        },
      }
    );
  };

  return (
    <>
      <section className="mb-10 px-52">
        <h2 className="font-bold text-2xl text-center">Thông tin cá nhân</h2>
        <form onSubmit={handleUpdateProfile} className="mt-4">
          <div className="mb-4 flex flex-col">
            <label htmlFor="name" className="text-base font-medium text-black">
              Họ và tên
            </label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập tên của bạn"
              required
              className="mt-2 px-4 py-1 w-auto rounded-md outline-none bg-white border border-gray-400 hover:border-black focus:border-black"
            />
          </div>
          <div className="mb-4 flex flex-col">
            <label htmlFor="name" className="text-base font-medium text-black">
              Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập họ của bạn"
              required
              className="mt-2 px-4 py-1 w-auto rounded-md outline-none bg-white border border-gray-400 hover:border-black focus:border-black"
            />
          </div>
          <div className="mb-4 flex flex-col">
            <label htmlFor="name" className="text-base font-medium text-black">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
              className="mt-2 px-4 py-1 w-auto rounded-md outline-none bg-white border border-gray-400 hover:border-black focus:border-black"
            />
          </div>
          <button
            type="submit"
            onClick={handleUpdateProfile}
            className="w-full py-2 px-1 text-white rounded-md mt-2 bg-[#eb3e32] hover:bg-[#c7342b] duration-200"
          >
            Cập nhật thông tin
          </button>
        </form>
      </section>
    </>
  );
}

export default Account;
