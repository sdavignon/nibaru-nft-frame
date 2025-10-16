// --- Frame buttons: add a link to your external mint page ---
// Paste/merge this into your existing server/app.js endpoints.
// Set MINT_URL in your server env (e.g., a Zora/Manifold/your mint page).

const { MINT_URL = 'https://warpcast.com' } = process.env;

// Replace your existing /frame and /frame/mint with these versions or merge the button/links into your file.

app.get('/frame', async (req, res) => {
  const og = "https://dummyimage.com/1200x630/000/fff&text=Mothership+Nibaru";
  const html = `
  <!doctype html><html><head>
    <meta property="og:title" content="Mothership Nibaru – Passage" />
    <meta property="og:image" content="${og}" />
    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${og}" />

    <meta name="fc:frame:button:1" content="Mint (In-Frame)" />
    <meta name="fc:frame:post_url" content="/frame/confirm" />

    <meta name="fc:frame:button:2" content="Mint on Site" />
    <meta name="fc:frame:button:2:action" content="link" />
    <meta name="fc:frame:button:2:target" content="${MINT_URL}" />
  </head></html>`;
  res.set('Content-Type', 'text/html').status(200).send(html);
});

app.post('/frame/mint', async (req, res) => {
  // ...wire your tx logic and set ok + txHash...
  const ok = false;      // placeholder
  const txHash = "";     // placeholder

  const og = ok
    ? "https://dummyimage.com/1200x630/062/fff&text=Mint+Success"
    : "https://dummyimage.com/1200x630/600/fff&text=Mint+Failed";

  const viewUrl = txHash ? `https://basescan.org/tx/${txHash}` : MINT_URL;
  const html = `
  <!doctype html><html><head>
    <meta property="og:title" content="${ok ? "Minted!" : "Mint failed"}" />
    <meta property="og:image" content="${og}" />
    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${og}" />

    <meta name="fc:frame:button:1" content="View Tx" />
    <meta name="fc:frame:button:1:action" content="link" />
    <meta name="fc:frame:button:1:target" content="${viewUrl}" />

    <meta name="fc:frame:button:2" content="Mint More" />
    <meta name="fc:frame:button:2:action" content="link" />
    <meta name="fc:frame:button:2:target" content="${MINT_URL}" />
  </head></html>`;
  res.set('Content-Type', 'text/html').status(200).send(html);
});
