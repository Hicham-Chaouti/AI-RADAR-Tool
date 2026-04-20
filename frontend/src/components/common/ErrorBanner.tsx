/** Error banner for displaying error messages. */
export default function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {message}
        </div>
    )
}
