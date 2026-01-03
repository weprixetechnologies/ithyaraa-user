import axiosInstance from '@/lib/axiosInstance';
import React, { useState, useEffect } from 'react';
import { MdCancel } from 'react-icons/md';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"

const SelectAddress = ({ onSelect, showAll = false, layout = 'layout1' }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [internalShowAll, setInternalShowAll] = useState(false);
    const [selectedAddressID, setSelectedAddressID] = useState(null);
    const [addressForm, setAddressForm] = useState({});
    const [open, setOpen] = useState(false);

    const handleChange = (e, name) => {
        setAddressForm({ ...addressForm, [name]: e.target.value });
    };

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/address/all-address');
            const fetched = response.data.addresses || [];
            setAddresses(fetched);

            // Select first address by default if available
            if (fetched.length > 0) {
                setSelectedAddressID(fetched[0].addressID);
                onSelect?.(fetched[0]);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/address/add-address', addressForm);
            alert('Address submitted successfully!');
            setAddressForm({});
            setOpen(false);
            await fetchAddresses(); // <-- re-fetch after adding
        } catch (error) {
            console.error("Error submitting address:", error);
            alert('Failed to submit address. Please try again.');
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDelete = (id) => {
        // implement your delete logic here
        console.log("Delete address ID:", id);
    };

    const handleSelect = (address) => {
        setSelectedAddressID(address.addressID);
        onSelect?.(address);
    };

    // Decide which addresses to display
    let displayedAddresses = addresses;
    if (!showAll && !internalShowAll) {
        displayedAddresses = addresses.slice(0, 1);
    }

    return (
        <div className="rounded-lg mb-5 mt-5">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <p className="text-lg font-medium">Select Address:</p>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button className="px-3 py-2 bg-primary-yellow font-medium rounded-lg cursor-pointer">
                            Add Address
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                <p className='font-medium'>Add Address - Detail</p>
                            </DialogTitle>
                            <DialogDescription>
                                Please fill the details to add address
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="flex flex-col">
                                    <label className='text-xs pb-1'>Address Line 1</label>
                                    <input
                                        type="text"
                                        placeholder='Enter Address Line 1'
                                        required
                                        value={addressForm.line1 || ''}
                                        className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                        onChange={(e) => handleChange(e, 'line1')}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className='text-xs pb-1'>Address Line 2</label>
                                    <input
                                        type="text"
                                        placeholder='Enter Address Line 2'
                                        required
                                        value={addressForm.line2 || ''}
                                        className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                        onChange={(e) => handleChange(e, 'line2')}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className='text-xs pb-1'>Landmark</label>
                                    <input
                                        type="text"
                                        placeholder='Enter Landmark of your area'
                                        required
                                        value={addressForm.landmark || ''}
                                        className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                        onChange={(e) => handleChange(e, 'landmark')}
                                    />
                                </div>
                                <div className="grid gap-3 grid-cols-2">
                                    <div className="flex flex-col">
                                        <label className='text-xs pb-1'>State</label>
                                        <input
                                            type="text"
                                            placeholder='Enter State'
                                            required
                                            value={addressForm.state || ''}
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                            onChange={(e) => handleChange(e, 'state')}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className='text-xs pb-1'>City / Region / District</label>
                                        <input
                                            type="text"
                                            placeholder='Enter City / Region / District'
                                            value={addressForm.city || ''}
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                            onChange={(e) => handleChange(e, 'city')}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-3 grid-cols-2">
                                    <div className="flex flex-col">
                                        <label className='text-xs pb-1'>Pincode</label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.pincode || ''}
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                            onChange={(e) => handleChange(e, 'pincode')}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className='text-xs pb-1'>Phone Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={addressForm.phonenumber || ''}
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                            onChange={(e) => handleChange(e, 'phonenumber')}
                                        />
                                    </div>
                                </div>
                                <div className="grid">
                                    <label className='text-xs'>Select Address Type</label>
                                    <select
                                        required
                                        value={addressForm.type || ''}
                                        className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                        onChange={(e) => handleChange(e, 'type')}
                                    >
                                        <option value="">Select type...</option>
                                        <option value="work">Work</option>
                                        <option value="home">Home</option>
                                        <option value="friend">Friend/Relative</option>
                                    </select>
                                </div>
                            </div>

                            <DialogFooter className="mt-5 flex gap-2">
                                <DialogClose asChild>
                                    <button
                                        type="button"
                                        className="px-3 py-2 border rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </DialogClose>
                                <button
                                    type="submit"
                                    className='ml-2 px-3 py-2 bg-primary-yellow rounded-lg'
                                >
                                    Save changes
                                </button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Address list */}
            <div className="grid grid-cols-2 md:grid-cols-3 w-full gap-2">
                {displayedAddresses.map((address) => (
                    <div
                        key={address.addressID}
                        className={`border min-h-10 rounded-md px-4 py-3 relative cursor-pointer transition-all
                            ${selectedAddressID === address.addressID
                                ? 'bg-primary-yellow text-white border-primary-yellow'
                                : 'border-gray-200 bg-white'}`}
                        onClick={() => handleSelect(address)}
                    >
                        <p className="text-[16px] font-medium mb-2 capitalize">
                            {address.type || 'Unknown'}
                        </p>
                        <p className={`text-sm ${selectedAddressID === address.addressID ? 'text-black' : 'text-secondary-text-deep'} line-clamp-1`}>
                            {address.line1}
                        </p>
                        {address.line2 && (
                            <p className={`text-sm ${selectedAddressID === address.addressID ? 'text-black' : 'text-secondary-text-deep'} line-clamp-1`}>
                                {address.line2}
                            </p>
                        )}
                        <p className={`text-sm ${selectedAddressID === address.addressID ? 'text-black' : 'text-secondary-text-deep'} line-clamp-1`}>
                            {address.city} - {address.pincode}
                        </p>
                        {address.phoneNumber && (
                            <p className={`text-sm ${selectedAddressID === address.addressID ? 'text-black' : 'text-secondary-text-deep'} line-clamp-1`}>
                                Call: {address.phoneNumber}
                            </p>
                        )}

                        <button
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(address.addressID);
                            }}
                        >
                            <MdCancel />
                        </button>
                    </div>
                ))}

                {/* Empty state */}
                {addresses.length === 0 && !loading && (
                    <p className="text-center text-gray-500">No addresses found.</p>
                )}

                {/* Toggle button */}
                {addresses.length > 1 && !showAll && (
                    <button
                        className="text-black border border-primary-yellow px-4 py-2 text-sm rounded-md self-start hover:underline"
                        onClick={() => setInternalShowAll((prev) => !prev)}
                    >
                        {internalShowAll ? "Show Less" : "Show More"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SelectAddress;
