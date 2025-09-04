import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  Grid,
  Alert,
  IconButton
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { loadAll, addEntry, generateShortcode, isValidUrl } from "../utils/storage.js";

export default function ShortenerPage() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [validMinutes, setValidMinutes] = useState("30");
  const [entries, setEntries] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setEntries(loadAll());
  }, []);

  function showMsg(severity, text) {
    setMessage({ severity, text });
    setTimeout(() => setMessage(null), 3500);
  }

  function handleCreate() {
    setMessage(null);
    const trimmed = (url || "").trim();
    if (!trimmed) {
      showMsg("error", "Please enter a URL.");
      return;
    }

    if (!isValidUrl(trimmed)) {
      showMsg("error", "That doesn't look like a valid URL.");
      return;
    }

    const all = loadAll();
    let code = (customCode || "").trim();

    if (code) {
      if (!/^[A-Za-z0-9_-]{3,12}$/.test(code)) {
        showMsg("error", "Shortcode must be 3–12 chars (letters, numbers, _ or -).");
        return;
      }
      if (all[code]) {
        showMsg("error", `Shortcode "${code}" is already taken.`);
        return;
      }
    } else {
      code = generateShortcode(all);
    }

    let minutes = parseInt(validMinutes, 10);
    if (!Number.isFinite(minutes) || minutes <= 0) minutes = 30;

    const now = Date.now();
    const entry = {
      longUrl: trimmed,
      shortcode: code,
      createdAtMs: now,
      expiryMs: now + minutes * 60 * 1000,
      clicks: []
    };

    addEntry(entry);
    setEntries(loadAll());
    setUrl("");
    setCustomCode("");
    showMsg("success", `Short URL created: ${window.location.origin}/${code}`);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showMsg("success", "Copied to clipboard.");
    } catch {
      showMsg("error", "Could not copy.");
    }
  }

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Create short link
      </Typography>

      {message && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <TextField
              label="Original URL"
              fullWidth
              placeholder="https://example.com/very/long/url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Validity (minutes)"
              fullWidth
              value={validMinutes}
              onChange={(e) => setValidMinutes(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Shortcode (opt)"
              fullWidth
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleCreate}>Create</Button>
              <Button variant="outlined" onClick={() => { setUrl(""); setCustomCode(""); setValidMinutes("30"); }}>
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>Existing links</Typography>

      {Object.keys(entries).length === 0 && <Typography>No short links yet.</Typography>}

      <Stack spacing={2} sx={{ mt: 1 }}>
        {Object.entries(entries).map(([k, it]) => (
          <Card key={k}>
            <CardContent>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography><strong>{k}</strong> → {it.longUrl}</Typography>
                  <Typography variant="caption">Expires: {new Date(it.expiryMs).toLocaleString()}</Typography>
                </Grid>

                <Grid item xs={10} md={3}>
                  <Typography variant="body2">Short: <a href={`/${k}`}>{window.location.origin}/{k}</a></Typography>
                  <Typography variant="caption">Clicks: {(it.clicks || []).length}</Typography>
                </Grid>

                <Grid item xs={2} md={1}>
                  <IconButton size="small" onClick={() => copyToClipboard(`${window.location.origin}/${k}`)}>
                    <ContentCopyIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
