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
  fileInput:
    'w-full cursor-pointer rounded-md border border-border bg-background text-sm text-foreground file:mr-4 file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-medium file:text-primary hover:file:bg-primary/15',
  helperText: 'text-xs text-foreground/65',
  imagePreviewContainer:
    'flex min-h-44 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-foreground/5 p-2 sm:col-span-2',
  imagePreview: 'h-44 w-full rounded-md object-contain',
  imagePlaceholder: 'text-sm text-foreground/60',
  actions: 'flex justify-end gap-3 border-t border-border/40 pt-4',
} as const;
