/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link } from "react-router-dom";
import useGet from "~/hooks/useGet";
import Image from "~/components/Image";
import Categories from "~/models/Categories";
import { useDispatch, useSelector } from "react-redux";

import { useEffect } from "react";
import { RootState } from "~/redux/store";
import { setActiveMenu } from "~/redux/menuSlice";

function Nav() {
    const dispatch = useDispatch();
    const activeMenu = useSelector((state: RootState) => state.menu.activeMenu);
    const { data: categories, error, isLoading } = useGet<Categories[]>(`/categories/getAllCategories`);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading categories</div>;
    const handleMenu = (id: string) => {
        dispatch(setActiveMenu(id));
        sessionStorage.setItem("menuActive", id);
    };

    return (
        <div className="grid grid-cols-6 gap-2 px-40 pt-10">
            {categories?.map((category) => (
                <Link
                    to={`/${category.slug}`}
                    key={category.id}
                    className="w-[193px] block"
                    onClick={() => handleMenu("shop")}
                >
                    <div className="bg-white w-full flex justify-center items-center gap-x-4 px-4 py-1 rounded">
                        <span className="font-semibold text-sm">{category.name}</span>
                        <Image src={category.img} alt={category.name} className="size-16" />
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default Nav;