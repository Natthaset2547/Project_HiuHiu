import Link from 'next/link'
import { categories } from '@/lib/data'

export function Categories() {
  return (
    <section>
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">หมวดหมู่สินค้า</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
        {categories.map(({ slug, label, icon: Icon }) => (
          <Link
            key={slug}
            href={slug === 'ทั้งหมด' ? '/shops' : `/shops?category=${slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center transition hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-5" />
            </span>
            <span className="text-xs font-medium leading-tight text-foreground text-pretty">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}