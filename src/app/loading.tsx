export default function LoadingPage() {
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Carregando...</p>
        </div>
    )
}