import React from 'react'

const HomeCategory = () => {
    const categories = [
        { name: "T-Shirts", image: "https://www.beyoung.in/api/catalog/HomePageJuly2025/sh.jpg" },
        { name: "Hoodies", image: "https://www.beyoung.in/api/catalog/HomePageJuly2025/t.jpg" },
        { name: "Accessories", image: "https://www.beyoung.in/api/catalog/HomePageJuly2025/os.jpg" },
        { name: "Footwear", image: "https://www.beyoung.in/api/catalog/HomePageJuly2025/ca.jpg" },
        { name: "Bags", image: "https://www.beyoung.in/api/catalog/HomePageJuly2025/po.jpg" },
        { name: "Bags", image: "https://www.beyoung.in/api/catalog/HomePageJuly2025/je.jpg" },
        { name: "Bags", image: "https://www.beyoung.in/api/catalog/HomePageJuly2025/PTS.jpg" },
        { name: "Bags", image: "https://www.beyoung.in/api/catalog/HomePageJuly2025/ptss.jpg" },
        { name: "Bags", image: "https://www.beyoung.in/api/catalog/HomePageJuly2025/jg.jpg" },
        { name: "Bags", image: "https://www.beyoung.in/api/catalog/HomePageJuly2025/box.jpg" }
    ]
    return (
        <div className="py-10">
            <div className="flex flex-col items-center mb-10">
                <p className="text-lg font-medium md:text-xl mtext-center">Your Categories</p>
                <p className="text-xs font-medium text-secondary-text-deep md:text-center md:text-sm">Have fun with our extended collections</p>
            </div>

            <div className='grid md:grid-cols-6 gap-2 md:px-15 px-2 grid-cols-2'>

                {
                    categories.map((category, index) => (
                        <div className="col-span-1 border aspect-[219/281] w-full" key={index}>
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default HomeCategory
