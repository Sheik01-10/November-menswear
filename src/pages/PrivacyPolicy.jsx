import { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import "./PrivacyPolicy.css";

export default function PrivacyPolicy() {
  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* HEADER */}
      <Header cartCount={0} />

      <div className="privacy-page">
        {/* HERO SECTION */}
        <section className="privacy-hero">
          <BackButton />
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="privacy-small">LEGAL & PRIVACY</p>
            <h1 className="privacy-title">Privacy Policy</h1>
            <p className="privacy-updated">Last Updated: July 2026</p>
          </motion.div>
        </section>

        {/* POLICY CONTENT */}
        <div className="privacy-content">
          <motion.section 
            className="privacy-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>1. INTRODUCTION</h2>
            <p>
              Welcome to <strong>NOVEMBER</strong>. We are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy details how we collect, process, use, and share information when you visit our website, register an account, purchase products, or engage with our services.
            </p>
            <p>
              By accessing our website and purchasing our luxury menswear collections, you consent to the practices described in this Privacy Policy.
            </p>
          </motion.section>

          <motion.section 
            className="privacy-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>2. INFORMATION WE COLLECT</h2>
            <p>
              To offer a premium shopping experience, we collect specific information, including:
            </p>
            <ul>
              <li><strong>Personal details</strong>: Your name, email address, phone number, and account credentials when you register or order.</li>
              <li><strong>Delivery Information</strong>: Shipping address, billing details, city, state, postal code, and any landmark details.</li>
              <li><strong>Payment Information</strong>: Order transactions, payment methods chosen (COD or online), and Razorpay transaction signatures. We do not store credit card details directly; all online transactions are securely handled by our licensed payment processors.</li>
              <li><strong>Device & Usage Data</strong>: IP addresses, browser types, page viewing history, search parameters, and wishlist interactions.</li>
            </ul>
          </motion.section>

          <motion.section 
            className="privacy-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>3. HOW WE USE YOUR INFORMATION</h2>
            <p>
              Your data is processed under strict confidentiality guidelines to fulfill the following services:
            </p>
            <ul>
              <li>Processing and delivering your bespoke apparel orders, including shipping coordination and order tracking.</li>
              <li>Securing and verifying online transactions via Razorpay.</li>
              <li>Managing your November Client Account and order history database.</li>
              <li>Improving our website navigation, product placement, and design layout.</li>
              <li>Providing premium customer support, responding to inquiries, and sharing luxury updates if requested.</li>
            </ul>
          </motion.section>

          <motion.section 
            className="privacy-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>4. COOKIES & TRACKING TECHNOLOGIES</h2>
            <p>
              We utilize cookies and local storage tokens to enhance user experience, save cart selections, retain your wishlist, and recall your preferences.
            </p>
            <p>
              You can disable cookies through your browser settings, though doing so might disable certain essential shopping functions of our online store, such as maintaining item quantities in your shopping bag.
            </p>
          </motion.section>

          <motion.section 
            className="privacy-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>5. DATA SHARING & THIRD-PARTIES</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We share data only with trusted service providers to run our services:
            </p>
            <ul>
              <li><strong>Delivery Partners</strong>: Courier companies to dispatch and transport your packages to your doorstep.</li>
              <li><strong>Payment Gateways</strong>: Razorpay for encrypting and handling card/net-banking transactions.</li>
              <li><strong>Authentication Services</strong>: Firebase Auth to safely manage user sign-ins and passwords.</li>
            </ul>
          </motion.section>

          <motion.section 
            className="privacy-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>6. DATA SECURITY</h2>
            <p>
              We employ SSL encryption, secure network channels, and industry-standard security protocols to protect your personal details from unauthorized access, loss, or disclosure.
            </p>
            <p>
              While we take maximum measures to protect your data, no method of digital transmission or storage is 100% secure. We encourage you to use unique passwords for your account to enhance your own security.
            </p>
          </motion.section>

          <motion.section 
            className="privacy-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>7. YOUR RIGHTS & CHOICE</h2>
            <p>
              As a valued November client, you possess rights over your personal data:
            </p>
            <ul>
              <li>Access, edit, or update your name, address, and profile settings in your client dashboard.</li>
              <li>Request the complete deletion of your account and related records by reaching out to our service team.</li>
              <li>Opt-out of any promotional email communications.</li>
            </ul>
          </motion.section>

          <motion.section 
            className="privacy-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>8. CONTACT US</h2>
            <p>
              For any queries regarding this Privacy Policy, please contact our support desk:
            </p>
            <ul>
              <li><strong>Email</strong>: www.novemberxix@gmail.com</li>
              <li><strong>Address</strong>: 291, Gandhiji Road, Surampattivalasu, Erode, Tamil Nadu - 638001</li>
              <li><strong>Phone</strong>: +91 7604801743, +91 7604901743</li>
            </ul>
          </motion.section>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </>
  );
}
