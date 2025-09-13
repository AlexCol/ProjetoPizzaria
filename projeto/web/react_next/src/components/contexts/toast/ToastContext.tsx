import React from 'react'
import { ToastContainer } from 'react-toastify'
// import { Toaster } from 'react-hot-toast'

function ToastContext({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <Toaster position="top-right" /> */}
      <ToastContainer
        position="top-right"
        autoClose={3000}       // tempo de fechar
        hideProgressBar={false} // deixa a barrinha visível
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"        // ou "light" / "dark"
      />
      {children}
    </>
  )
}

export default ToastContext