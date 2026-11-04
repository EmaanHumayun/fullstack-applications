import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Universal Button Component
 * Variants: primary, secondary, outline, ghost, destructive, link, icon
 * Sizes: sm, md, lg, icon
 */
export const Button = forwardRef(function Button(
  {
    children,
    as: Component = null,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon: Icon = null,
    iconRight: IconRight = null,
    to = null,
    href = null,
    className = '',
    onClick,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  const baseStyles =
    'relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 whitespace-nowrap cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 rounded-lg gap-1.5 min-h-[34px]',
    md: 'text-xs sm:text-sm px-4.5 py-2 rounded-xl gap-2 min-h-[42px]',
    lg: 'text-sm sm:text-base px-6 py-2.5 rounded-xl gap-2.5 min-h-[48px]',
    icon: 'p-2 rounded-xl h-10 w-10 shrink-0'
  };

  const variantStyles = {
    primary:
      'bg-primary text-[var(--primary-text,#ffffff)] shadow-md hover:bg-primary-hover active:scale-[0.98] border border-transparent shadow-stone-900/10',
    secondary:
      'bg-surface text-ink border border-border shadow-xs hover:bg-hover-surface hover:border-gold active:bg-selected-surface',
    outline:
      'bg-transparent text-ink border border-border hover:bg-hover-surface hover:border-primary active:bg-surface',
    ghost:
      'bg-transparent text-text-secondary hover:text-primary hover:bg-hover-surface active:bg-selected-surface border border-transparent',
    destructive:
      'bg-[#92140c] text-white hover:bg-[#aa170e] active:bg-[#7b110a] border border-transparent shadow-md',
    link:
      'bg-transparent text-primary p-0 h-auto hover:underline font-bold active:opacity-80 inline-flex items-center gap-1.5 shadow-none'
  };

  const computedClass = `${baseStyles} ${size === 'icon' ? sizeStyles.icon : sizeStyles[size] || sizeStyles.md} ${
    variantStyles[variant] || variantStyles.primary
  } ${className}`;

  const content = (
    <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap leading-none w-auto pointer-events-none">
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin shrink-0" />
      ) : Icon ? (
        typeof Icon === 'function' || typeof Icon === 'object' ? (
          <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="shrink-0" />
        ) : (
          Icon
        )
      ) : null}

      {size === 'icon' ? <span className="sr-only">{children}</span> : children}

      {!isLoading && IconRight ? (
        typeof IconRight === 'function' || typeof IconRight === 'object' ? (
          <IconRight size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="shrink-0" />
        ) : (
          IconRight
        )
      ) : null}
    </span>
  );

  // If explicit "as" component passed
  if (Component) {
    return (
      <Component ref={ref} to={to} href={href} className={computedClass} onClick={onClick} {...props}>
        {content}
      </Component>
    );
  }

  if (to) {
    return (
      <Link ref={ref} to={to} className={computedClass} onClick={onClick} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('//');
    return (
      <a
        ref={ref}
        href={href}
        className={computedClass}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer noopener' : undefined}
        onClick={onClick}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={computedClass}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;
