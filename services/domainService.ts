
export const DNS_RECORDS = {
  A_ROOT: "76.76.21.21",
  CNAME_WWW: "cname.vercel-dns.com"
};

export const DomainService = {
  /**
   * Verifica via Google DNS se os registos do domínio estão corretos.
   * Não requer bibliotecas externas.
   */
  async verifyDNS(domain: string): Promise<{ rootOk: boolean; wwwOk: boolean; status: 'pending' | 'invalid' | 'verified' }> {
    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // 1. Verificar Registo A no domínio raiz (ex: agencia.pt)
    const rootOk = await this.checkRecord(cleanDomain, 'A', DNS_RECORDS.A_ROOT);
    
    // 2. Verificar Registo CNAME no subdomínio www (ex: www.agencia.pt)
    // Se o utilizador inseriu apenas agencia.pt, verificamos www.agencia.pt
    const wwwDomain = cleanDomain.startsWith('www.') ? cleanDomain : `www.${cleanDomain}`;
    const wwwOk = await this.checkRecord(wwwDomain, 'CNAME', DNS_RECORDS.CNAME_WWW);

    let status: 'pending' | 'invalid' | 'verified' = 'invalid';
    if (rootOk && wwwOk) status = 'verified';
    else if (rootOk || wwwOk) status = 'pending';

    return { rootOk, wwwOk, status };
  },

  async checkRecord(name: string, type: string, expected: string): Promise<boolean> {
    try {
      const response = await fetch(`https://dns.google/resolve?name=${name}&type=${type}`);
      const data = await response.json();
      
      if (!data.Answer) return false;
      
      // Verifica se algum dos registos retornados coincide com o esperado
      return data.Answer.some((ans: any) => {
        const val = ans.data.endsWith('.') ? ans.data.slice(0, -1) : ans.data;
        return val === expected;
      });
    } catch (err) {
      console.error(`DNS check failed for ${name}:`, err);
      return false;
    }
  },

  isValidFormat(domain: string): boolean {
    if (!domain) return false;
    // Regex simples para formato de domínio
    const pattern = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
    return pattern.test(domain) && !domain.includes('imosuite.pt');
  }
};
