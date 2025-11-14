import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface ProductShowcaseProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  reverse?: boolean
  features?: string[]
}

export function ProductShowcase({
  title,
  description,
  imageSrc,
  imageAlt,
  reverse = false,
  features = []
}: ProductShowcaseProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 })

  return (
    <section 
      ref={ref}
      className={cn(
        'relative py-12 md:py-16 lg:py-20 overflow-hidden transition-all duration-700',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      )}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 feature-gradient -z-10" />
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          className={cn(
            'grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center',
            reverse && 'lg:grid-flow-dense'
          )}
        >
          {/* Text content */}
          <div className={cn('space-y-4 md:space-y-6', reverse && 'lg:col-start-2')}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              {title}
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
            
            {/* Feature highlights */}
            {features.length > 0 && (
              <ul className="space-y-3" role="list">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div 
                      className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-green/10 flex items-center justify-center mt-0.5"
                      aria-hidden="true"
                    >
                      <svg
                        className="w-4 h-4 text-primary-green"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Screenshot */}
          <div className={cn('relative', reverse && 'lg:col-start-1 lg:row-start-1')}>
            <div className="relative rounded-lg md:rounded-xl overflow-hidden shadow-xl md:shadow-2xl border border-gray-200 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={800}
                height={600}
                className="w-full h-auto"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                quality={85}
              />
            </div>
            
            {/* Decorative element - hidden on mobile for performance */}
            <div className="hidden md:block absolute -z-10 top-8 -right-8 w-72 h-72 bg-primary-orange/10 rounded-full blur-3xl transition-opacity duration-300" />
            <div className="hidden md:block absolute -z-10 -bottom-8 -left-8 w-72 h-72 bg-primary-green/10 rounded-full blur-3xl transition-opacity duration-300" />
          </div>
        </div>
      </div>
    </section>
  )
}
