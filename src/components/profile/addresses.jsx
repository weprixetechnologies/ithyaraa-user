import React from 'react'
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

const Addresses = () => {
    const handleSubmit = (e) => {
        e.preventDefault(); // prevent page reload
        alert('Submitted');
    };

    return (
        <div className="p-4">
            <div className="flex w-full justify-between items-center mb-10">
                <p className='text-lg font-medium'>Your Saved Addresses</p>
                <Dialog>
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

                        {/* Form starts here */}
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="flex flex-col">
                                    <label className='text-xs pb-1'>Address Line 1</label>
                                    <input
                                        type="text"
                                        placeholder='Enter Address Line 1'
                                        className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className='text-xs pb-1'>Address Line 2</label>
                                    <input
                                        placeholder='Enter Address Line 2'
                                        required
                                        type="text"
                                        className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className='text-xs pb-1'>Landmark</label>
                                    <input
                                        placeholder='Enter Landmark of your area'
                                        required
                                        type="text"
                                        className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                    />
                                </div>
                                <div className="grid gap-3 grid-cols-2">
                                    <div className="flex flex-col">
                                        <label className='text-xs pb-1'>State</label>
                                        <input
                                            placeholder='Enter State'
                                            type="text"
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className='text-xs pb-1'>City / Region / District</label>
                                        <input
                                            placeholder='Enter City / Region / District'
                                            type="text"
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-3 grid-cols-2">
                                    <div className="flex flex-col">
                                        <label className='text-xs pb-1'>Pincode</label>
                                        <input
                                            required
                                            type="text"
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className='text-xs pb-1'>Phone Number</label>
                                        <input
                                            type="text"
                                            className='border border-gray-200 h-[35px] rounded-lg px-2 text-sm outline-none'
                                        />
                                    </div>
                                </div>
                                <div className="grid">
                                    <label htmlFor="" className='text-xs'>Select Address Type</label>
                                    <select name="" required id="">
                                        <option value="work" className='text-xs'>Work</option>
                                        <option value="home" className='text-xs'>Home</option>
                                        <option value="friend" className='text-xs'>Friend/Relative</option>
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
                        {/* Form ends here */}
                    </DialogContent>
                </Dialog>
            </div>

            <AddressesList />
        </div>
    )
}

export default Addresses
