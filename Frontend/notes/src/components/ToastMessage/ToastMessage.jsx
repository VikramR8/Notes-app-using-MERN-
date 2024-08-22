import React, { useEffect } from 'react'
import { LuCheck } from "react-icons/lu"
import { MdDeleteOutline } from 'react-icons/md'

const ToastMessage = ({ isShown, message, type, onClose }) => {

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onClose();
        }, 3000);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [onClose]);

    return (
        <div className={`fixed top-20 right-6 transition-opacity duration-300 ease-in-out ${
            isShown ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
            <div className={`min-w-52 border shadow-2xl rounded-md overflow-hidden ${
                type === "delete" ? "bg-red-500" : "bg-green-500"
            }`}>
                <div className='flex items-center gap-3 py-2 px-4'>
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                        type === "delete" ? "bg-red-50" : "bg-green-50"
                    }`}>
                        {type === "delete" ? (
                            <MdDeleteOutline className="text-xl text-red-500" />
                        ) : (
                            <LuCheck className="text-xl text-green-500" />
                        )}
                    </div>
                    <p className='text-sm text-white'>{message}</p>
                </div>
            </div>
        </div>
    );
}

export default ToastMessage;
