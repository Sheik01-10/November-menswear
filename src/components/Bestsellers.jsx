import { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { getOptimizedImageUrl } from "../utils/imageOptimizer";
import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

import {
  Navigation,
} from "swiper/modules";

import {
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

import "./Bestsellers.css";
import WishlistButton from "../components/WishlistButton";
import ShareButton from "../components/ShareButton";

export default function Bestsellers() {
  const { products } = useProducts();
  const bestsellerProducts = products.filter(p => p.isBestseller);

  const [isBeginning,
    setIsBeginning] =
    useState(true);

  const [isEnd,
    setIsEnd] =
    useState(false);

  return (
    <section className="bestseller-section">

      {/* Header */}
      <div className="bestseller-header">

        {/* Left Arrow */}
        <button
          className={`custom-prev ${isBeginning
              ? "hide-arrow"
              : ""
            }`}
        >
          <ChevronLeft
            size={22}
          />
        </button>

        {/* Title */}
        <p className="bestseller-title">
          OUR BESTSELLER
        </p>

        {/* Right Arrow */}
        <button
          className={`custom-next ${isEnd
              ? "hide-arrow"
              : ""
            }`}
        >
          <ChevronRight
            size={22}
          />
        </button>

      </div>

      {/* Swiper */}
      <Swiper
        modules={[Navigation]}
        slidesPerView={4}
        spaceBetween={24}
        loop={false}

        navigation={{
          nextEl:
            ".custom-next",

          prevEl:
            ".custom-prev",
        }}

        onInit={(swiper) => {
          setIsBeginning(
            swiper.isBeginning
          );

          setIsEnd(
            swiper.isEnd
          );
        }}

        onSlideChange={(swiper) => {
          setIsBeginning(
            swiper.isBeginning
          );

          setIsEnd(
            swiper.isEnd
          );
        }}

        breakpoints={{
          0: {
            slidesPerView: 2,
            spaceBetween: 14,
          },

          768: {
            slidesPerView: 3,
            spaceBetween: 18,
          },

          1200: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
        }}
      >
        {bestsellerProducts.map(
          (item) => (
            <SwiperSlide
              key={item.id}
            >
              <Link
                to={`/product/${item.id}`}
                className="product-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >

                <div className="product-image">

                  {/* Front */}
                  <img
                    src={getOptimizedImageUrl(item.front, 600)}
                    alt={item.name}
                    className="front-img"
                    loading="lazy"
                  />

                  {/* Back */}
                  <img
                    src={getOptimizedImageUrl(item.back, 600)}
                    alt={item.name}
                    className="back-img"
                    loading="lazy"
                  />

                  {/* Wishlist */}
                  <WishlistButton product={item} />

                  {/* Share */}
                  <ShareButton product={item} />

                  {/* Discount */}
                  <span className="discount-badge">
                    {item.pct}
                  </span>

                </div>

                <div className="product-info">

                  <p className="brand-name">
                    NOVEMBER
                  </p>

                  <h3>
                    {item.name}
                  </h3>

                  <div className="price-wrap">

                    <span className="price">
                      {item.price}
                    </span>

                    <span className="compare-price">
                      {item.compare}
                    </span>

                  </div>

                </div>

              </Link>
            </SwiperSlide>
          )
        )}
      </Swiper>
      <div className="view-all-wrap">
        <Link
          to="/products"
          className="view-all-btn"
        >
          View All Collection
        </Link>
      </div>

    </section>

  );
}