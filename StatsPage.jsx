import React, { useEffect, useState } from "react";
import {
  Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, Button
} from "@mui/material";
import { loadAll, deleteAll } from "../utils/storage.js";

export default function StatsPage() {
  const [data, setData] = useState({});

  useEffect(() => {
    setData(loadAll());
  }, []);

  function refresh() {
    setData(loadAll());
  }

  function handleClear() {
    if (!confirm("Clear all shortlinks and click data?")) return;
    deleteAll();
    setData({});
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Stats</Typography>

      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Shortcode</TableCell>
              <TableCell>Long URL</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Clicks</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.keys(data).length === 0 && (
              <TableRow><TableCell colSpan={5}>No data</TableCell></TableRow>
            )}

            {Object.entries(data).map(([k, it]) => (
              <TableRow key={k}>
                <TableCell>{k}</TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>{it.longUrl}</TableCell>
                <TableCell>{new Date(it.createdAtMs).toLocaleString()}</TableCell>
                <TableCell>{new Date(it.expiryMs).toLocaleString()}</TableCell>
                <TableCell>
                  {(it.clicks || []).length}
                  <details>
                    <summary>Details</summary>
                    {(it.clicks || []).length === 0 && <div>No clicks yet</div>}
                    <ul>
                      {(it.clicks || []).map((c, idx) => (
                        <li key={idx}>{new Date(c.ts).toLocaleString()} — {c.ref || "direct"}</li>
                      ))}
                    </ul>
                  </details>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={refresh}>Refresh</Button>
          <Button variant="contained" color="error" onClick={handleClear}>Clear All</Button>
        </Box>
      </Paper>
    </Box>
  );
}
