import { type ComponentProps } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type FileUploadProps = ComponentProps<'label'> & {
  variant?: 'primary' | 'secondary';
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFileSelect?: (files: FileList | null) => void;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const FileUpload = ({
  variant: _variant,
  accept,
  multiple,
  disabled,
  onFileSelect,
  className,
  children,
  ...props
}: FileUploadProps) => {
  return (
    <label
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        'w-full min-h-[120px] px-6 py-8',
        'rounded-xl',
        'border-2 border-dashed border-(--file-upload-border)',
        'bg-(--file-upload-bg)',
        'text-sm text-(--file-upload-text)',
        'transition-all duration-160 ease-in-out',
        'cursor-pointer',
        'outline-none',
        'hover:border-(--file-upload-border-hover) hover:bg-(--file-upload-bg-hover)',
        'focus-within:border-(--file-upload-border-hover) focus-within:ring-2 focus-within:ring-(--file-upload-focus)',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => onFileSelect?.(e.target.files)}
      />
      {children ?? (
        <>
          <span aria-hidden="true" className="text-(--file-upload-text)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </span>
          <span>Drop files here or click to upload</span>
        </>
      )}
    </label>
  );
};
