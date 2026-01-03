import React from 'react'

const loading = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="loadingspinner">
                <div id="square1"></div>
                <div id="square2"></div>
                <div id="square3"></div>
                <div id="square4"></div>
                <div id="square5"></div>
            </div>
        </div>
    )
}

export default loading
