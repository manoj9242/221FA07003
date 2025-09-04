import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEntry, addClick } from "../utils/storage.js";
import { Box, Typography, Button } from "@mui/material";

export default function RedirectHandler() {
  const { shortcode } = useParams();
  const [status, setStatus] = useState("checking");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!shortcode) return;
    const entry = getEntry(shortcode);

    if (!entry) {
      setStatus("error");
      setMsg("Shortcode not found.");
      return;
    }

    if (entry.expiryMs && entry.expiryMs < Date.now()) {
      setStatus("error");
      setMsg("Short link expired.");
      return;
    }

    try {
      addClick(shortcode, { ts: Date.now(), ref: document.referrer || "direct" });
    } catch (err) {
      console.error("Error adding click:", err);
    }

    setStatus("redirecting");
    window.location.replace(entry.longUrl);
  }, [shortcode]);

  if (status === "checking") return <Typography>Checking link…</Typography>;
  if (status === "redirecting") return <Typography>Redirecting…</Typography>;

  return (
    <Box>
      <Typography variant="h6">Error</Typography>
      <Typography>{msg}</Typography>
      <Button component={Link} to="/" sx={{ mt: 2 }}>
        Back to create
      </Button>
    </Box>
  );
}
