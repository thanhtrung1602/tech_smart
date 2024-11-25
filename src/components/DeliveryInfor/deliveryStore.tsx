import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useGet from "~/hooks/useGet";
import useProvince from "~/hooks/useProvince";
import District from "~/models/District";
// import Province from "~/models/Province";
// import Stock from "~/models/stock";
import Store from "~/models/Store";
import { setSelectIdStore } from "~/redux/addressSlice";
import { RootState } from "~/redux/store";
type objCommon = {
  code: string | number | undefined;
  name: string | undefined;
};

export default function DeliveryStore() {
  const dispatch = useDispatch();
  const { resultValueStock, selectIdStore } = useSelector(
    (state: RootState) => state.address
  );
  const { data: storeProducts } = useGet<Store[]>(`/store/findAll`);

  const [codeDistrict, setCodeDistrict] = useState<objCommon>({
    code: 0,
    name: "",
  });

  //   const { data: provinces } = useProvince<Province>("/province/");
  const provinceId = 79;
  const { data: districts } = useProvince<District[]>(
    `/province/district/${provinceId}`,
    {
      enabled: !!provinceId,
    }
  );

  const filteredStores = storeProducts?.filter((store) => {
    console.log(store);

    const matchesDistrict =
      codeDistrict.code === 0 || store?.district?.code === codeDistrict.code;

    return matchesDistrict;
  });

  console.log("hahahahah: ", filteredStores);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          TỈNH / THÀNH PHỐ
        </label>
        <select className="w-full p-2.5 bg-white text-sm border border-gray-200 rounded focus:outline-none">
          <option>Hồ Chí Minh</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Quận/Huyện
        </label>
        <select
          className="w-full p-2.5 bg-white text-sm border border-gray-200 rounded focus:outline-none"
          onChange={(e) => {
            const selectedValue = e.target.value;
            if (selectedValue === "") {
              setCodeDistrict({ code: 0, name: "" });
            } else {
              const findDistrict = districts?.find(
                (d) => d.district_id.toString() === selectedValue
              );
              setCodeDistrict({
                code: findDistrict?.district_id,
                name: findDistrict?.district_name,
              });
            }
          }}
        >
          <option value="">Tất cả</option>
          {districts?.map((district) => (
            <option key={district?.district_id} value={district?.district_id}>
              {district?.district_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">CỬA HÀNG</label>
        <select
          onChange={(e) => dispatch(setSelectIdStore(e.target.value))}
          className="w-full bg-white p-2.5 text-sm border border-gray-200 rounded focus:outline-none"
        >
          <option>Chọn địa chỉ cửa hàng</option>
          {filteredStores?.map((store) => (
            <option key={store.id} value={store.id}>
              {store?.street}, {store?.ward}, {store?.district?.name},{" "}
              {store?.province?.name}
            </option>
          ))}
        </select>
        {selectIdStore !== 0 && (
          <p className="text-[#d97706] text-sm flex justify-end">
            {resultValueStock.deliveryTime}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Ghi chú khác (nếu có)
        </label>
        <input
          type="text"
          className="w-full p-2.5 bg-white text-sm border border-gray-200 rounded focus:outline-none"
          placeholder="Nhập ghi chú"
        />
      </div>
    </div>
  );
}
