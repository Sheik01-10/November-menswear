import { useState, useEffect } from "react";
import "./BrandStory.css";

const QUOTES = [
  {
    title: "THE NOVEMBER",
    text:
      "THE NOVEMBER is built for men who believe style is more than appearance. Every piece is thoughtfully designed to elevate confidence, elegance and everyday luxury.",
  },

  {
    title: "TIMELESS LUXURY",
    text:
      "Crafted with premium quality and refined details, our collections redefine modern menswear with sophistication and individuality.",
  },
];

export default function BrandStory() {
  const [current,
    setCurrent] =
    useState(0);

  useEffect(() => {

    const timer =
      setInterval(() => {

        setCurrent(
          (prev) =>
            (prev + 1)
            % QUOTES.length
        );

      }, 5000);

    return () =>
      clearInterval(timer);

  }, []);

  return (
    <section className="brand-story">

      <div className="brand-content">

        <h2>
          {
            QUOTES[current]
              .title
          }
        </h2>

        <p>
          "
          {
            QUOTES[current]
              .text
          }
          "
        </p>

        <div className="story-dots">

          {
            QUOTES.map(
              (_, index) => (
                <span
                  key={index}
                  className={
                    current ===
                    index
                      ? "dot active"
                      : "dot"
                  }
                  onClick={() =>
                    setCurrent(
                      index
                    )
                  }
                ></span>
              )
            )
          }

        </div>
      </div>
    </section>
  );
}