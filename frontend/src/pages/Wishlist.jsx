import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/profile?tab=wishlist", { replace: true });
  }, [navigate]);
  return null;
}
