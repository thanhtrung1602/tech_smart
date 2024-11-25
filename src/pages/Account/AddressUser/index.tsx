import { useDispatch, useSelector } from "react-redux";
import Button from "~/components/Button";
import FormAddress from "~/components/FormAddress";
import useGet from "~/hooks/useGet";

import { FaEdit, FaTrash } from "react-icons/fa";

import { useDelete } from "~/hooks/usePost";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import Province from "~/models/Province";
import useProvince from "~/hooks/useProvince";
import { RootState } from "~/redux/store";
import {
  setAddressId,
  setHiddenForm,
  setProvinceId,
} from "~/redux/addressSlice";

export interface IAddress {
  id: number;
  name: string;
  phone: number;
  province: {
    code: string | number | undefined;
    name: string | undefined;
  };
  district: {
    code: string | number | undefined;
    name: string | undefined;
  };
  ward: string;
  street: string;
}

function AddressUser() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { addressId, hiddenForm } = useSelector(
    (state: RootState) => state.address
  );
  const userProfile = useSelector(
    (state: RootState) => state.userProfile.userProfile
  );
  const { data: provinces } = useProvince<Province[]>("/province/");
  const { data: addressUpdate } = useGet<IAddress>(
    `/address/getAddress/${addressId}`
  );
  const { mutate: delAddress } = useDelete();
  const { data: addressUsers } = useGet<IAddress[]>(
    `/address/getAddressesByUser/${userProfile?.id}`
  );

  const handleClickUpdate = (id: number) => {
    const findProvince = provinces?.find((p) => {
      return p.province_id === addressUpdate?.province?.code;
    });
    dispatch(setHiddenForm());
    dispatch(setAddressId(id));
    dispatch(setProvinceId(findProvince?.province_id));
  };

  const handleDelAddress = (id: number) => {
    delAddress(`/address/deleteAddress/${id}`, {
      onSuccess: (res) => {
        if (res.status === 200) {
          toast.success("Đã xóa");
          queryClient.invalidateQueries({
            queryKey: [`/address/getAddressesByUser/${userProfile?.id}`],
          });
        }
      },
    });
  };
  return (
    <>
      {hiddenForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-[700px]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => {
                dispatch(setHiddenForm());
                dispatch(setAddressId(0));
              }}
            >
              &times;
            </button>
            <FormAddress />
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <h2 className="font-bold text-2xl">Địa chỉ nhận hàng</h2>
        <Button
          className="p-2 text-white rounded-md mt-2 bg-[#eb3e32] hover:bg-[#c7342b] duration-200"
          onClick={() => dispatch(setHiddenForm())}
        >
          Thêm địa chỉ mới
        </Button>
      </div>
      <div className="flex justify-between">
        <div className=" w-full rounded-lg ">
          {addressUsers?.map((address) => (
            <div
              className="flex items-center justify-between mb-1 shadow-sm rounded-lg border-b hover:bg-gray-100 hover:rounded-lg duration-200"
              key={address.id}
            >
              <div className="p-3 space-y-1 flex flex-col">
                <div className="flex items-center">
                  <p className="border-r pr-1 text-base text-black">
                    {address.name}
                  </p>
                  <p className="pl-1 text-sm">{address.phone}</p>
                </div>
                <p className="text-sm text-black">
                  {address.street}, {address.ward}, {address.district.name},{" "}
                  {address.province.name}
                </p>
              </div>
              <div className="flex items-center pr-3 text-main600">
                <button
                  className="pr-1 border-r"
                  onClick={() => handleClickUpdate(address.id)}
                >
                  <FaEdit className="text-green-600 text-lg" />
                </button>
                <button
                  className="pl-1"
                  onClick={() => handleDelAddress(address.id)}
                >
                  <FaTrash className="text-red-600 text-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AddressUser;
