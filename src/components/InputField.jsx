import { useState } from "react";

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  error,
  rightSlot,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      {(label || rightSlot) && (
        <div className="flex items-center justify-between gap-2 mb-2">
          {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
          {rightSlot && <div className="text-xs">{rightSlot}</div>}
        </div>
      )}

      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all
            ${isPassword ? "pr-11" : ""}
            ${error
              ? "border-red-400"
              : "border-gray-300 focus:border-nexu-teal focus:ring-2 focus:ring-nexu-teal/10"
            }`}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-400 hover:text-nexu-teal"
          >
            {showPassword ? (
              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58A3 3 0 0013.42 13.42M9.88 4.24A10.94 10.94 0 0112 4.5c4.64 0 8.58 3.01 9.96 7.18a1 1 0 010 .64 10.93 10.93 0 01-4.36 5.56M6.23 6.23A10.9 10.9 0 002.04 11.68a1 1 0 000 .64C3.42 16.49 7.36 19.5 12 19.5c1.75 0 3.4-.43 4.85-1.2" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.04 12.32a1 1 0 010-.64C3.42 7.51 7.36 4.5 12 4.5c4.64 0 8.58 3.01 9.96 7.18.07.21.07.43 0 .64C20.58 16.49 16.64 19.5 12 19.5c-4.64 0-8.58-3.01-9.96-7.18z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
