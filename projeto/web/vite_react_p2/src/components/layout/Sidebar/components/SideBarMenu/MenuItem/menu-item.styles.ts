export const menuItemStyles = {
  // Item do menu
  menuItemTC: `
    flex
    items-center
    gap-3
    px-4
    py-3
    rounded-2xl
    cursor-pointer
    group
    relative
    overflow-visible
  `,
  menuItemActiveTC: `
    bg-primary
    text-white
    font-semibold
    shadow-lg
    shadow-primary/20
  `,
  menuItemInactiveTC: `
    hover:bg-background
    hover:text-primary
    hover:shadow-md
  `,
  menuItemCollapsedTC: `
    justify-center
    px-3
  `,

  // Link e containers
  menuLinkTC: `
    flex
    items-center
    gap-3
    flex-1
    min-w-0
    relative
    z-10
    overflow-visible
  `,
  menuLabelContainerTC: `
    flex
    items-center
    gap-3
    flex-1
    min-w-0
    relative
    overflow-visible
  `,
  iconContainerTC: `
    relative
  `,

  // Ícone e label
  menuIconTC: `
    shrink-0
    transition-transform
    duration-200
    group-hover:scale-110
  `,
  menuLabelTC: `
    whitespace-nowrap
    text-sm
    font-medium
    transition-[opacity,width,margin]
    duration-300
    ease-in-out
    opacity-100
    max-w-50
    ml-0
    overflow-hidden
    text-ellipsis
  `,
  activeChildDotTC: `
    absolute
    -right-1
    -bottom-1
    w-2
    h-2
    bg-primary
    rounded-full
    animate-pulse
  `,

  // Toggle button
  toggleButtonTC: `
    flex
    items-center
    justify-center
    ml-auto
    rounded-xl
    transition-all
    duration-200
    hover:scale-110
    active:scale-95
    opacity-100
  `,
  toggleButtonCollapsedTC: `
    absolute
    top-1
    right-1
    hover:bg-transparent

  `,
  chevronContainerTC: `
    transition-transform
  `,
  chevronContainerOpenTC: `
    rotate-180
  `,
  chevronOpenTC: `
    text-primary
  `,
  chevronClosedTC: `
  `,

  // Filhos
  childrenContainerTC: `
    transition-[max-height,opacity]
    duration-300
    ease-in-out
  `,
  childrenContainerOpenTC: `
    max-h-500
    opacity-100
  `,
  childrenContainerClosedTC: `
    max-h-0
    opacity-0
    pointer-events-none
    overflow-hidden
  `,
  childrenListTC: `
    mt-1
    space-y-1
    transform
    transition-transform
    duration-300
    ease-in-out
  `,
  childrenListOpenTC: `
    translate-y-0
  `,
  childrenListClosedTC: `
    -translate-y-2
  `,
};
