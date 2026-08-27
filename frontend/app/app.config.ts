export default defineAppConfig({
  ui: {
    /*
      Every colour slot maps to a palette that actually exists in main.css.
      `primary` is ink, not a brand hue — the only saturated colour in the
      product is coverage state, so a coloured button would compete with the
      one signal that matters.
    */
    colors: {
      primary: 'ink',
      secondary: 'ink',
      neutral: 'ink',
      success: 'covered',
      warning: 'stale',
      error: 'failed',
      info: 'ink'
    },

    button: {
      slots: {
        base: 'font-medium rounded-full transition-colors duration-150 ease-out'
      },
      variants: {
        size: {
          xs: { base: 'px-3.5 py-1.5 text-[13px] gap-1.5' },
          sm: { base: 'px-4 py-2 text-[13px] gap-2' },
          md: { base: 'px-5 py-2.5 text-[14px] gap-2' },
          lg: { base: 'px-6 py-3 text-[15px] gap-2' },
          xl: { base: 'px-7 py-3.5 text-[16px] gap-2.5' }
        }
      },
      compoundVariants: [{
        color: 'neutral',
        variant: 'outline',
        class: 'bg-transparent ring-accented text-highlighted hover:bg-elevated'
      }, {
        color: 'neutral',
        variant: 'ghost',
        class: 'text-toned hover:text-highlighted hover:bg-elevated'
      }]
    },

    input: {
      slots: { base: 'rounded-[10px] transition-colors duration-150 ease-out' },
      variants: {
        size: {
          lg: { base: 'h-11 px-4 text-[14px]' },
          xl: { base: 'h-[52px] px-4 text-[15px]' }
        }
      }
    },

    /* Status pill: soft tint fill, full-strength text. Read at a glance. */
    badge: {
      slots: { base: 'rounded-full font-medium' },
      variants: {
        size: {
          sm: { base: 'px-2.5 py-0.5 text-[12px]' },
          md: { base: 'px-3 py-1 text-[13px]' },
          lg: { base: 'px-3.5 py-1.5 text-[13px]' }
        }
      },
      defaultVariants: { variant: 'soft', size: 'md' }
    },

    /* Proof and position tables: header band, row rules, no zebra, no vertical rules. */
    table: {
      slots: {
        root: 'relative overflow-x-auto',
        base: 'min-w-full',
        tbody: 'divide-y divide-default',
        tr: 'border-b border-default last:border-b-0 hover:bg-muted/60 transition-colors',
        th: 'bg-muted px-4 py-3 text-[12px] font-medium uppercase tracking-[0.08em] text-muted text-start whitespace-nowrap',
        td: 'px-4 py-4 text-[14px] text-toned align-middle',
        empty: 'py-16 text-center text-[14px] text-muted'
      }
    },

    card: {
      slots: {
        root: 'rounded-panel ring-default shadow-none',
        header: 'p-6',
        body: 'p-6',
        footer: 'p-6'
      }
    },

    container: {
      base: 'max-w-(--ui-container) mx-auto px-5 sm:px-8 lg:px-10'
    },

    separator: {
      slots: { border: 'border-default' }
    },

    tabs: {
      slots: {
        list: 'rounded-full bg-transparent ring ring-default p-1',
        indicator: 'rounded-full bg-inverted',
        trigger: 'rounded-full text-[13px] text-toned data-[state=active]:text-inverted'
      }
    }
  }
})
