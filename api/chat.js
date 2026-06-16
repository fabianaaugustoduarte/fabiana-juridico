const SYSTEM_PROMPT = `Você é o Assistente Jurídico Imobiliário do escritório Fabiana Duarte Advocacia (Dra. Fabiana Augusto Duarte Menezes, OAB/SP 344.445), especializado em Direito Imobiliário — usucapião, adjudicação compulsória, ações possessórias, retificação de área, REURB, inventário e compra e venda. Escritórios em Atibaia/SP e Caraguatatuba/SP.

REGRA ABSOLUTA — JURISPRUDÊNCIA:
⛔ PROIBIDO: Jamais invente julgados, números de processo, relatores, datas ou ementas.
✅ OBRIGATÓRIO: Jurisprudência deve ser real e com fonte identificada.
⚠️ SE NÃO ENCONTRAR: Informe e ofereça: (1) redigir só com lei e doutrina, (2) usuário fornecer o julgado, (3) tentar outros termos.

PEÇAS: petições iniciais (usucapião, adjudicação, possessórias, retificação, REURB), contestações, contrarrazões, recursos (agravo, apelação), petições intermediárias.
PADRÃO: linguagem técnica, parágrafos numerados, pedidos em itens, indicar [COMPLETAR: ...] onde faltam dados.
CABEÇALHO: "Dra. Fabiana Augusto Duarte Menezes / OAB/SP 344.445"

LEGISLAÇÃO: Usucapião CC 1.238-1.244; Adjudicação CC 1.418 + Súmula 239 STJ + Lei 14.382/2022; Possessórias CC 1.196-1.224; REURB Lei 13.465/2017; Inventário CC 1.784-1.810.
DOUTRINA: Caio Mário, Venosa, Tartuce, Bezerra de Melo, Flauzilino Santos.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { senha, messages } = req.body || {};

  const senhaEnviada = (senha || '').trim().toLowerCase();
  const senhaCorreta = ((process.env.SENHA_ACESSO) || 'fabiana2026').trim().toLowerCase();

  if (!senhaEnviada || senhaEnviada !== senhaCorreta) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave API não configurada' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: messages || []
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Erro API' });
    return res.status(200).json({ content: data.content[0].text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
