import React, { useEffect } from 'react'

const Hello = () => {
    useEffect(() => {
        console.log('Hellow Called');

    }, [])
    return (
        <div>

        </div>
    )
}

export default Hello
