import React from 'react'

const TilledMiniCategories = ({
    isMobile = true
}) => {
    const categories = [
        { name: "T-Shirts", image: "https://picsum.photos/200/300" },
        { name: "Hoodies", image: "https://picsum.photos/200/300" },
        { name: "Accessories", image: "https://picsum.photos/200/300" },
        { name: "Footwear", image: "https://picsum.photos/200/300" },
        { name: "Bags", image: "https://picsum.photos/200/300" },
        { name: "Caps", image: "https://picsum.photos/200/300" },
        { name: "Sunglasses", image: "https://picsum.photos/200/300" },
        { name: "Watches", image: "https://picsum.photos/200/300" },
        { name: "Jewelry", image: "https://picsum.photos/200/300" },
        { name: "Belts", image: "https://picsum.photos/200/300" },
        { name: "Wallets", image: "https://picsum.photos/200/300" },
        { name: "Scarves Check", image: "https://picsum.photos/200/300" },
        { name: "Gloves", image: "https://picsum.photos/200/300" },
        { name: "Socks", image: "https://picsum.photos/200/300" },
        { name: "Keychains", image: "https://picsum.photos/200/300" },
        { name: "Phone Cases", image: "https://picsum.photos/200/300.jpg" }]
    return (
        <div className={` overflow-x-auto scrollbar-hide ${isMobile ? "flex md:hidden" : "hidden md:flex"}`}>
            {categories.map((category, index) => (
                <div key={index} className="flex flex-col items-center p-2">
                    <img src={category.image} alt={category.name} className="w-20 h-20 min-w-20 min-h-20 object-cover mb-2 rounded-lg" />
                    <p className="text-xs text-center font-medium max-w-20">{category.name}</p>
                </div>
            ))}

        </div>
    )
}

export default TilledMiniCategories
