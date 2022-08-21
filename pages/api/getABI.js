// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  
  const { contractAddress } = req.body;

  const endpoint = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`;

  fetch(endpoint).then(response => response.json()).then(data => {
    res.json(data.result);
  }).catch(err => {
    res.status(500).json({ error: err.message });
  }).finally(() => {
    res.end();
  });

  //res.status(200).json({ name: 'John Doe' })
}
