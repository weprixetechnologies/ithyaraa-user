"use client"

import FilterComponent from "@/components/ui/filterComponent"
import { useDispatch, useSelector } from "react-redux"
import { addCartAsync } from "@/redux/slices/cartSlice"

const Shop = () => {
    const dispatch = useDispatch()


    const dispatchEnter = () => {
        dispatch(addCartAsync({ uid: "618I2VKA", productID: "ITHYP4c8SB", quantity: 10 }));
    }
    return (
        <div className="py-2 flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 w-[90%]">
                <aside className="md:col-span-3 px-2 py-3  border-black h-[calc(100vh-70px)] md:h-[calc(100dvh-170px)] overflow-y-auto">
                    <p className="text-xl font-medium">Filters :</p>
                    <button onClick={dispatchEnter} className="border p-3 cursor-pointer">Enter Here</button>
                    <hr className="border-gray-200 mt-2" />
                    <FilterComponent />
                </aside>
                <main className="md:col-span-9 border -black h-[calc(100vh-70px)] md:h-[calc(100dvh-170px)] overflow-y-auto">
                    {/* Shop products here */}
                </main>
            </div>
        </div>
    )
}

export default Shop
