import { useEffect, useRef, useState } from "react";
import { useProducts } from "../context/ProductContext";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";
import "./FeaturedCategories.css";

export default function FeaturedCategories() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const { categories } = useProducts();

  useEffect(() => {
    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
          } else {
            setVisible(false);
          }
        },
        {
          threshold: 0.15,
        }
      );

    const currentRef =
      sectionRef.current;

    if (currentRef) {
      observer.observe(
        currentRef
      );
    }

    return () => {
      if (currentRef) {
        observer.unobserve(
          currentRef
        );
      }
    };
  }, []);
  return (
    <section
      aria-label="Featured categories"
      ref={sectionRef}
      className={`featured-section ${visible
          ? "show-section"
          : ""
        }`}
    >
      <div className="curate-section">

        <p className="curate-section-title">
          Featured Categories
        </p>

        <div className="curate-categories">
          {categories.map(
            (c, index) => (
              <a
                key={c._id}
                href={c.href || `/products?category=${c.label.toLowerCase()}`}
                className="curate-cat-card"
                aria-label={c.label}
                style={{
                  transitionDelay:
                    `${index * 120}ms`,
                }}
              >
                <img
                  src={getOptimizedImageUrl(c.img, 400)}
                  alt={c.label}
                  loading="lazy"
                />

                <div className="curate-cat-label">
                  {c.label}
                </div>
              </a>
            )
          )}
        </div>

      </div>
    </section>
  );
}