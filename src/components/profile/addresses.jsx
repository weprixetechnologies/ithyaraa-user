import React, { useState } from 'react'
import AddressesList from './addressesList'
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

import axiosInstance from '../../lib/axiosInstance'

const Addresses = () => {
    const [addressForm, setAddressForm] = useState({})
    const [open, setOpen] = useState(false) // control dialog open state

    const handleChange = (e, name) => {
        setAddressForm({ ...addressForm, [name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(addressForm);

        try {
            const response = await axiosInstance.post('/address/add-address', addressForm);
            console.log("Response:", response.data);
            alert('Address submitted successfully!');
            setOpen(false); // close dialog on success
        } catch (error) {
            console.error("Error submitting address:", error);
            alert('Failed to submit address. Please try again.');
        }
    };


    return (
        <div className="p-4">
            <div className="flex w-full justify-between items-center mb-10">
                <p className='text-lg font-medium'>Your Saved Addresses</p>
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
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                            onChange={(e) => handleChange(e, 'state')}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className='text-xs pb-1'>City / Region / District</label>
                                        <input
                                            type="text"
                                            placeholder='Enter City / Region / District'
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
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                            onChange={(e) => handleChange(e, 'pincode')}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className='text-xs pb-1'>Phone Number</label>
                                        <input
                                            type="text"
                                            required
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                            onChange={(e) => handleChange(e, 'phonenumber')}
                                        />
                                    </div>
                                </div>
                                <div className="grid">
                                    <label className='text-xs'>Select Address Type</label>
                                    <select
                                        required
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

            <AddressesList />
        </div>
    )
}

export default Addresses
