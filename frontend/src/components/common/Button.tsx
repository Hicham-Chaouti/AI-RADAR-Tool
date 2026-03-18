/** Reusable button component with DXC styling. */
interface ButtonProps {
    children: React.ReactNode
    onClick?: () => void
    variant?: 'primary' | 'secondary'
    disabled?: boolean
    type?: 'button' | 'submit'
}

export default function Button({ children, onClick, variant = 'primary', disabled = false, type = 'button' }: ButtonProps) {
    const base = 'px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50'
    const variants = {
        primary: 'bg-dxc-blue text-white hover:bg-dxc-blue-dark',
        secondary: 'bg-white text-dxc-blue-dark border border-dxc-blue hover:bg-blue-50',
    }
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
            {children}
        </button>
    )
}
