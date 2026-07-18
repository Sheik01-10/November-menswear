import "./Contact.css";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export default function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !comment.trim()) {
      toast.error("Please fill in all required fields (Name, Email, Comment)");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Sending message...");

    try {
      const formattedMessage = phone.trim()
        ? `Phone: ${phone.trim()}\n\nComment:\n${comment.trim()}`
        : comment.trim();

      const payload = {
        name: name.trim(),
        email: email.trim(),
        subject: `Contact Inquiry from ${name.trim()}`,
        message: formattedMessage,
      };

      await axios.post(`${BACKEND}/api/support`, payload);

      toast.success("Message sent successfully!", { id: toastId });
      setName("");
      setPhone("");
      setEmail("");
      setComment("");
    } catch (err) {
      console.error("Error submitting contact form:", err);
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      {/* HEADER */}
      <Header cartCount={0} />

      <div className="contact-page">

        {/* HERO */}
        <section className="contact-hero">

          <BackButton />

          <motion.div
            className="contact-header"
            initial={{
              opacity: 0,
              y: 50,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1,
            }}
          >
            <p className="contact-small">
              CONTACT
            </p>

            <h1>
              NEED HELP?
              <br />
              GET IN TOUCH
            </h1>

            <p className="contact-sub">
              Be the first to know
              about new collections
              and exclusive offers.
            </p>
          </motion.div>
        </section>

        {/* CONTACT CONTENT */}
        <section className="contact-section">

          {/* FORM */}
          <motion.div
            className="contact-form-box"
            initial={{
              opacity: 0,
              x: -100,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 1,
            }}
            viewport={{
              once: true,
            }}
          >
            <form onSubmit={handleSubmit}>

              <div className="row">

                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />

                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />

              <textarea
                rows="8"
                placeholder="Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
                required
              ></textarea>

              <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

            </form>
          </motion.div>

        </section>
      </div>

      {/* FOOTER */}
      <Footer />
    </>
  );
}