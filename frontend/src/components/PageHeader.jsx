function PageHeader({
  title,
  subtitle,
  containerClassName = 'mb-6',
  titleClassName = 'text-3xl font-bold text-emerald-800',
  subtitleClassName = 'mt-1 text-sm text-emerald-700/80',
}) {
  return (
    <div className={containerClassName}>
      <h1 className={titleClassName}>{title}</h1>
      {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
    </div>
  )
}

export default PageHeader
