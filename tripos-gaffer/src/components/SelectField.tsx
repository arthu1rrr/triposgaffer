type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  children: React.ReactNode;
};

export function SelectField({
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
  children,
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm mb-1 text-[var(--medshadow)]">{label}</label>

      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          appearance-none
          rounded-md
          border
          border-[var(--mutedblack)]
          bg-[var(--background)]
          px-3
          py-2
          pr-8
          text-[var(--lightshadow)]
          focus:outline-none
          focus:ring-1
          focus:ring-[var(--lightshadow)]

          focus:outline-none
        focus-visible:outline-none
        focus:ring-0
        focus-visible:ring-0
          disabled:opacity-60
        "
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
    </div>
  );
}
