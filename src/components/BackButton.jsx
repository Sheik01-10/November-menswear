import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./BackButton.css";

export default function BackButton() {
  const navigate =
    useNavigate();

  return (
    <button
      className="back-btn"
      onClick={() =>
        navigate(-1)
      }
    >
      <ArrowLeft size={18} />

      <span>
        Back
      </span>
    </button>
  );
}