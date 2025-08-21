import React, { useEffect, useState } from 'react';
import { MdCancel } from "react-icons/md";
import axiosInstance from "@/lib/axiosInstance"; // Adjust path as needed

const AddressesList = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch addresses from API on component mount
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await axiosInstance.get('/address/all-address');
                setAddresses(response.data.addresses || []);
            } catch (error) {
                console.error("Error fetching addresses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAddresses();
    }, []);

    const handleDelete = async (addressID) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this address?');
        if (!confirmDelete) return;

        try {
            await axiosInstance.delete(`/address/${addressID}`);
            setAddresses(prev => prev.filter(addr => addr.addressID !== addressID));
        } catch (error) {
            console.error("Error deleting address:", error);
            alert("Failed to delete address. Please try again.");
        }
    };

    if (loading) return <p>Loading addresses...</p>;

    return (
        <div className="grid grid-cols-3 gap-3">
            {addresses.map((address) => (
                <div
                    key={address.addressID}
                    className="col-span-1 border border-gray-200 min-h-10 rounded-sm px-4 py-3 relative"
                >
                    <p className="text-[16px] text-shadow-secondary-text font-medium mb-2 capitalize">
                        {address.type || 'Unknown'}
                    </p>
                    <p className='text-sm text-secondary-text-deep line-clamp-1'>{address.line1}</p>
                    {address.line2 && <p className='text-sm text-secondary-text-deep line-clamp-1'>{address.line2}</p>}
                    <p className='text-sm text-secondary-text-deep line-clamp-1'>
                        {address.city} - {address.pincode}
                    </p>
                    {address.phoneNumber && (
                        <p className='text-sm text-secondary-text-deep line-clamp-1'>
                            Call: {address.phoneNumber}
                        </p>
                    )}

                    <button
                        className='absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold cursor-pointer'
                        onClick={() => handleDelete(address.addressID)}
                    >
                        <MdCancel />
                    </button>
                </div>
            ))}
            {addresses.length === 0 && !loading && (
                <p className="col-span-3 text-center text-gray-500">No addresses found.</p>
            )}
        </div>
    );
};

export default AddressesList;
