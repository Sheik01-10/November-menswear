import { useState, useEffect } from "react";
import "./BrandStory.css";

export default function BrandStory() {

  const quotes = [
    {
      title: "NOVEMBER",
      text:
        "NOVEMBER is built for men who believe style is more than appearance. Every piece is thoughtfully designed to elevate confidence, elegance and everyday luxury.",
    },

    {
      title: "TIMELESS LUXURY",
      text:
        "Crafted with premium quality and refined details, our collections redefine modern menswear with sophistication and individuality.",
    },
  ];

  const [current,
    setCurrent] =
    useState(0);

  useEffect(() => {

    const timer =
      setInterval(() => {

        setCurrent(
          (prev) =>
            (prev + 1)
            % quotes.length
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
            quotes[current]
              .title
          }
        </h2>

        <p>
          "
          {
            quotes[current]
              .text
          }
          "
        </p>

        <div className="story-dots">

          {
            quotes.map(
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