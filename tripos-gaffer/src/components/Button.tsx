type ButtonProps = {
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    };


export function Button({ onClick, children, disabled = false }: ButtonProps) {
    return (
    <button
    type = "button"
    onClick={onClick}
    disabled={disabled}
    className="
    inline-flex items-center justify-center
        rounded-md
        bg-[var(--blue)]
        px-4 py-2
        text-[#e6e8f0]
        disabled:opacity-60
      ">{children}</button>
    );
}