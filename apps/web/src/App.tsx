import { useEffect, useState } from 'react'

export default function App() {
  const [mensaje, setMensaje] = useState('Conectando al servidor...')

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        setMensaje(datos.message)
      })
      .catch((error) => {
        console.log(error);
        setMensaje('Error al conectar con el servidor')
      })
  }, [])

  return (
    <main className='min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4'>
      <h1 className='text-3xl font.bold tracking-tight mb-2'>Proyecto Deto</h1>
      <p className='text-emerald-400 font-mono text-sm bg-slate-800 px-4 py-2 rounded-lg border border-slate-700'>
        {mensaje}
      </p>
    </main>
  )
}
