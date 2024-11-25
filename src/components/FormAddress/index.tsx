import { useQueryClient } from "@tanstack/react-query";
import { FormEvent, memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import useGet from "~/hooks/useGet";
import usePost, { usePatch } from "~/hooks/usePost";
import useProvince from "~/hooks/useProvince";
import Address from "~/models/Address";
import District from "~/models/District";
import Province from "~/models/Province";
import Ward from "~/models/Ward";
import { IAddress } from "~/pages/Account/AddressUser";
import { setHiddenForm } from "~/redux/addressSlice";
import { RootState } from "~/redux/store";

type objCommon = {
  code: string | number | undefined;
  name: string | undefined;
};

function FormAddress() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { addressId, provinceId } = useSelector(
    (state: RootState) => state.address
  );
  console.log(addressId);
  const userProfile = useSelector(
    (state: RootState) => state.userProfile.userProfile
  );
  const { data: addressUpdate } = useGet<IAddress>(
    `/address/getAddress/${addressId}`
  );
  const [codeProvince, setCodeProvince] = useState<objCommon>({
    code: 0,
    name: "",
  });
  const [codeDistrict, setCodeDistrict] = useState<objCommon>({
    code: 0,
    name: "",
  });

  const [ward, setWard] = useState<string | null>(null);
  const [street, setStreet] = useState<string | undefined>("");
  const [name, setName] = useState<string | undefined>("");
  const [phone, setPhone] = useState<string>("");
  const { mutate: postAddress } = usePost();
  const { mutate: updateAddress } = usePatch();
  const { data: provinces } = useProvince<Province[]>("/province/");
  const [errors, setErrors] = useState({});
  console.log(addressUpdate);



  const { data: districts } = useProvince<District[]>(
    addressId
      ? `/province/district/${addressUpdate?.province.code}`
      : `/province/district/${codeProvince.code}`,
    {
      enabled: !!codeProvince.code,
    }
  );

  console.log("Asdasdasdad", districts);

  const { data: wards } = useProvince<Ward[]>(
    addressId
      ? `/province/ward/${addressUpdate?.district.code}`
      : `/province/ward/${codeDistrict.code}`,
    {
      enabled: !!codeDistrict.code,
    }
  );
  useEffect(() => {
    if (addressId) {
      setName(addressUpdate?.name);
      setPhone(String(addressUpdate?.phone));

      if (codeProvince.code === addressUpdate?.province.code) {
        console.log(codeProvince.code === addressUpdate?.province.code);
        setCodeProvince({
          code: addressUpdate?.province.code,
          name: addressUpdate?.province.name,
        });
      }
      setCodeDistrict({
        code: addressUpdate?.district.code,
        name: addressUpdate?.district.name,
      });
      setStreet(addressUpdate?.street);
    }
  }, [addressUpdate, addressId, provinces, districts, codeProvince]);

  const validateForm = () => {
    const newErrors: any = {};
    if (!name) newErrors.name = "Họ và tên không được để trống.";
    if (!phone) newErrors.phone = "Số điện thoại không được để trống.";
    else if (!/^\d{10,11}$/.test(phone)) {
      newErrors.phone = "Số điện thoại phải là 10-11 chữ số.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  console.log(errors);
  const handleSubmitAddress = (e: FormEvent) => {
    e.preventDefault();
    // Validation for name and phone fields
    if (validateForm()) {
      return;
    }

    const data = {
      province: {
        code: codeProvince.code,
        name: codeProvince.name,
      },
      name: name,
      phone: phone,
      ward: ward,
      district: {
        code: codeDistrict.code,
        name: codeDistrict.name,
      },
      street: street,
      userId: userProfile?.id,
    };

    if (addressId !== 0) {
      updateAddress(
        { url: `/address/updateAddress/${addressId}`, data },
        {
          onSuccess: (res) => {
            if (res.status === 200) {
              toast.success("Đã cập nhật địa chỉ");
              queryClient.invalidateQueries({
                queryKey: [`/address/getAddressesByUser/${userProfile?.id}`],
              });
              dispatch(setHiddenForm());
            }
          },
        }
      );
    } else {
      postAddress(
        { url: `/address/createAddress/`, data },
        {
          onSuccess: (res) => {
            if (res.status === 200) {
              toast.success("Đã thêm địa chỉ mới");
              queryClient.invalidateQueries({
                queryKey: [`/address/getAddressesByUser/${userProfile?.id}`],
              });
              dispatch(setHiddenForm());
              setCodeDistrict({
                code: 0,
                name: "",
              });
              setCodeProvince({
                code: 0,
                name: "",
              });
              setWard(null);
              setStreet("");
              setName("");
              setPhone("");
            }
          },
        }
      );
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-semibold text-black mb-4">
        {addressId !== 0 ? "Cập nhận địa chỉ" : "Thêm địa chỉ mới"}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmitAddress}>
        <h2 className="text-base font-medium text-[#657384] mb-4">
          Thông tin người nhận
        </h2>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full mt-1 p-2 rounded-md bg-white border border-gray-400 hover:border-black focus:border-black"
              placeholder="Nhập họ và tên"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full mt-1 p-2 rounded-md bg-white border border-gray-400 hover:border-black focus:border-black"
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>

        <h2 className="text-base font-medium text-[#657384] mb-4">
          Địa chỉ nhận hàng
        </h2>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Tỉnh/Thành Phố
            </label>
            <select
              className="block w-full mt-1 p-2 rounded-md bg-white border border-gray-400 hover:border-black focus:border-black"

              onChange={(e) => {
                const findProvince = provinces?.find((p) => {
                  console.log("cccc", p);
                  return p.province_id.toString() === e.target.value;
                });
                console.log("pppppppp", findProvince);
                setCodeProvince({
                  code: findProvince?.province_id,
                  name: findProvince?.province_name,
                });
              }}
            >
              <option value="" disabled selected hidden >
                {addressId !== 0
                  ? addressUpdate?.province.name
                  : "Chọn Tỉnh/Thành Phố"}
              </option>
              {provinces?.map((province) => (
                <option key={province.province_id} value={province.province_id}>
                  {province.province_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Quận/Huyện
            </label>
            <select
              className="block w-full mt-1 p-2 rounded-md bg-white border border-gray-400 hover:border-black focus:border-black"
              disabled={addressId ? false : codeProvince.code === 0}
              onChange={(e) => {
                const findDistrict = districts?.find((d) =>
                  addressId !== 0
                    ? d.district_name === addressUpdate?.district.name
                    : d.district_id.toString() === e.target.value
                );
                setCodeDistrict({
                  code: findDistrict?.district_id,
                  name: findDistrict?.district_name,
                });
              }}
            >
              {codeProvince.code === 0 && (
                <option value="" disabled selected hidden>
                  {addressId !== 0
                    ? addressUpdate?.district.name
                    : "Quận/Huyện"}
                </option>
              )}
              {districts?.map((district) => (
                <option key={district.district_id} value={district.district_id}>
                  {district.district_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Phường/Xã
            </label>
            <select
              className="block w-full mt-1 p-2 rounded-md bg-white border border-gray-400 hover:border-black focus:border-black"
              disabled={codeDistrict.code === 0}
              onChange={(e) => setWard(e.target.value)}
            >
              <option value="" disabled={addressId !== 0} selected hidden>
                {addressId !== 0 ? addressUpdate?.ward : "Phường/Xã"}
              </option>
              {wards?.map((ward) => (
                <option key={ward.ward_id} value={ward.ward_name}>
                  {ward.ward_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm  font-medium text-gray-700">
              Số nhà, tên đường
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="block w-full mt-1 p-2 rounded-md bg-white border border-gray-400 hover:border-black focus:border-black"
              placeholder="Số nhà, tên đường"
            />
          </div>
        </div>

        <button className="w-full mt-4 py-2 px-1 bg-[#eb3e32] text-white rounded-md hover:bg-[#c7342b] duration-200">
          Xác nhận
        </button>
      </form>
    </div>
  );
}

export default memo(FormAddress);
