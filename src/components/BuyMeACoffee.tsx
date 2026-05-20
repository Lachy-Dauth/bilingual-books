import clsx from 'clsx';

export function BuyMeACoffee({
  className,
  label = 'Buy me a coffee',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      href="https://www.buymeacoffee.com/lachydauth"
      target="_blank"
      rel="noopener noreferrer"
      className={clsx('bmc-link', className)}
    >
      <span aria-hidden="true">☕</span>
      <span>{label}</span>
    </a>
  );
}
