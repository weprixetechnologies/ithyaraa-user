import React from 'react'
import Image from 'next/image'
import PresaleCardCounter from './presalecardCounter'
import { useRouter } from 'next/navigation'
import logo from "../../../public/ithyaraa-logo.png"

const PreBookingProductCard = ({ product }) => {
    const router = useRouter()

    const featuredImage = product?.featuredImage || [];
    const imageUrl = featuredImage?.[0]?.imgUrl || logo;

    const now = new Date();
    const startDate = product?.preSaleStartDate ? new Date(product.preSaleStartDate) : null;
    const isUpcoming = startDate && startDate > now;

    const handleCardClick = () => {
        router.push(`/presale/product/${product.presaleProductID}`)
    }

    return (
        <div
            onClick={handleCardClick}
            className="w-full sm:w-[250px] overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer hover:shadow-lg hover:shadow-gray-300 hover:p-2 rounded-lg relative"
        >
            {isUpcoming && (
                <div className="absolute top-4 left-4 z-10 bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                    Upcoming
                </div>
            )}
            <div className="h-auto aspect-[170/222] w-full sm:max-w-[300px] mx-auto relative rounded-lg overflow-hidden">
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <Image
                        src={imageUrl}
                        alt={product?.name || 'Product'}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                        priority={false}
                    />
                </div>
            </div>
            <div className="p-2">
                <p className='text-[16px] font-medium text-center mb-2 line-clamp-2'>{product?.name}</p>
                <div className="flex justify-center items-center gap-2">
                    <span className="text-gray-500 text-sm font-medium line-through">₹{Math.round(product?.regularPrice || 0)}</span>
                    <span className="text-black text-lg font-bold">₹{Math.round(product?.salePrice || 0)}</span>
                    <span className="text-xs text-center text-green-500 font-medium " style={{ letterSpacing: '0.05em' }}>
                        ({Math.round(product?.discountValue || 0)}
                        {product?.discountType === "percentage"
                            ? "% "
                            : product?.discountType === "flat"
                                ? "/- "
                                : ` ${product?.discountType || ''}`}
                        Off)
                    </span>
                </div>
                <p className='hidden sm:block text-sm text-center text-red-500 font-medium my-2' style={{ letterSpacing: '0.05em' }}>
                    {isUpcoming ? 'Starts In' : 'Ends In'}
                </p>
            </div>
            <PresaleCardCounter 
                datetime={isUpcoming ? product.preSaleStartDate : product.preSaleEndDate} 
                label={isUpcoming ? "Starts In" : "Ends In"}
            />

            <button 
                disabled={isUpcoming}
                className={`w-full mt-2 font-semibold py-2 rounded-lg transition-all duration-300 ${
                    isUpcoming 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary-yellow text-black cursor-pointer hover:text-white hover:bg-orange-500'
                }`} 
                style={{ letterSpacing: '0.05em' }}
            >
                {isUpcoming ? 'Coming Soon' : 'Buy Now'}
            </button>
        </div>
    )
}

export default PreBookingProductCard

