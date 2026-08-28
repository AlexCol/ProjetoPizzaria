export const produtoModalStyles = {
  host: 'block',
  form: 'flex max-h-[85vh] flex-col gap-6 overflow-y-auto p-5 sm:p-6',
  title: 'text-xl font-bold text-primary-text',
  fields: 'grid gap-4 sm:grid-cols-2',
  fullWidthField: 'sm:col-span-2',
  fieldContainer: 'flex flex-col gap-1.5 sm:col-span-2',
  label: 'text-sm font-medium text-primary-text',
  requiredMark: 'text-danger',
  textarea:
    'min-h-28 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-danger',
  fileInput: 'hidden',
  helperText: 'text-xs text-foreground/65',
  imagePreviewContainer:
    'relative flex min-h-44 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-foreground/5 p-2 transition-colors sm:col-span-2',
  imagePreviewContainerDragging: 'border-primary bg-primary/10',
  imagePicker: 'flex min-h-40 w-full cursor-pointer items-center justify-center',
  imagePreview: 'h-44 w-full rounded-md object-contain',
  excludeButton: 'absolute right-2 top-2 z-20 text-sm',
  imagePlaceholder: 'text-sm text-foreground/60',
  actions: 'flex justify-end gap-3 border-t border-border/40 pt-4',
} as const;
