import React, { useState } from 'react';
import { MdCancel } from "react-icons/md";

const AddressesList = () => {
    const [addresses, setAddresses] = useState([
        {
            label: 'Home',
            lines: [
                '56 Subhas Nagar Bangalaxmi',
                'Near Noapara Metro Station',
                'Bengaluru - 500090',
                'Call : +917439398783'
            ]
        },
        {
            label: 'Work',
            lines: [
                'Sorajini Naidu Street',
                'Near Noapara Metro Station',
                'Bengaluru - 500090',
                'Call : +917439398783'
            ]
        },
        {
            label: 'External',
            lines: [
                'Nigampet',
                'Near Noapara Metro Station',
                'Bengaluru - 500090',
                'Call : +917439398783'
            ]
        },
        {
            label: 'External',
            lines: [
                'Nigampet',
                'Near Noapara Metro Station',
                'Bengaluru - 500090',
                'Call : +917439398783'
            ]
        },
        {
            label: 'External',
            lines: [
                'Nigampet',
                'Near Noapara Metro Station',
                'Bengaluru - 500090',
                'Call : +917439398783'
            ]
        },
    ]);

    const handleDelete = (index) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this address?');
        if (!confirmDelete) return;
        setAddresses(addresses.filter((_, i) => i !== index));
    };


    return (
        <div className="grid grid-cols-3 gap-3">
            {addresses.map((address, index) => (
                <div
                    key={index}
                    className="col-span-1 border border-gray-200 min-h-10 rounded-sm px-4 py-3 relative"
                >
                    <p className="text-[16px] text-shadow-secondary-text font-medium mb-2">{address.label}</p>
                    {address.lines.map((line, i) => (
                        <p key={i} className='text-sm text-secondary-text-deep line-clamp-1'>{line}</p>
                    ))}

                    <button
                        className='absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold cursor-pointer'
                        onClick={() => handleDelete(index)}
                    >
                        <MdCancel />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default AddressesList;
