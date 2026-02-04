# 🚀 Como Hospedar o GLB no GitHub Releases

O arquivo `saladesenho.glb` (172MB) excede o limite da Vercel (100MB por arquivo).
Você precisa hospedá-lo em um CDN separado.

## ✅ SOLUÇÃO RECOMENDADA: GitHub Releases (Gratuito)

### Passo 1: Upload Manual via GitHub

1. **Acesse a página de novo release:**
   ```
   https://github.com/NeuTr0n244/noah-01/releases/new
   ```

2. **Preencha o formulário:**
   - **Tag version**: `v1.0.0`
   - **Release title**: `Noah Universe - 3D Assets v1.0.0`
   - **Description**:
     ```
     3D model assets for Noah Universe website.

     Files:
     - saladesenho.glb (172MB) - Main 3D room model
     ```

3. **Arraste o arquivo:**
   - Localize o arquivo em: `C:\Users\NEUTRON\Documents\novonoah\public\models\saladesenho.glb`
   - Arraste e solte na área "Attach binaries"
   - Aguarde o upload (172MB pode levar alguns minutos)

4. **Publique:**
   - Clique em "Publish release"

5. **Copie a URL:**
   - Após publicar, clique no nome do arquivo
   - A URL será algo como:
     ```
     https://github.com/NeuTr0n244/noah-01/releases/download/v1.0.0/saladesenho.glb
     ```
   - **COPIE ESSA URL!** Você vai precisar dela no próximo passo.

---

### Passo 2: Configurar Variável de Ambiente na Vercel

#### Opção A - Via Dashboard (Mais Fácil):

1. **Acesse as configurações:**
   ```
   https://vercel.com/vito01hugo02-9635s-projects/novonoah/settings/environment-variables
   ```

2. **Adicione a variável:**
   - Clique em "Add New"
   - **Name**: `VITE_GLB_URL`
   - **Value**: (cole a URL do GitHub Releases do passo anterior)
   - **Environments**: Marque todas (Production, Preview, Development)
   - Clique em "Save"

3. **Force redeploy:**
   - Vá para: https://vercel.com/vito01hugo02-9635s-projects/novonoah
   - Clique nos três pontos (...) do último deployment
   - Selecione "Redeploy"

#### Opção B - Via CLI:

```bash
# Adicionar variável
vercel env add VITE_GLB_URL production

# Quando solicitado, cole a URL do GitHub Releases
# Exemplo: https://github.com/NeuTr0n244/noah-01/releases/download/v1.0.0/saladesenho.glb

# Force redeploy
vercel --prod --force
```

---

### Passo 3: Verificar

Depois do redeploy terminar (1-2 minutos):

1. **Acesse o site:**
   ```
   https://novonoah.vercel.app
   ```

2. **Verifique o modelo 3D:**
   - O modelo deve carregar (pode demorar 10-30 segundos na primeira vez - 172MB)
   - Abra o Console do navegador (F12) e verifique se não há erros

3. **Teste o link direto do GLB:**
   - Cole no navegador a URL que você configurou
   - Deve fazer download do arquivo GLB

---

## 🔧 Alternativa: Cloudflare R2 (Se GitHub Releases não funcionar)

### Vantagens:
- CDN global mais rápido que GitHub
- Gratuito até 10GB/mês de largura de banda
- URL mais limpa

### Passos:

1. **Criar conta Cloudflare:**
   - https://dash.cloudflare.com/sign-up

2. **Ativar R2:**
   - Dashboard > R2 Object Storage > Create bucket
   - Nome do bucket: `noah-universe-assets`
   - Marque como "Public"

3. **Upload do arquivo:**
   - Clique no bucket criado
   - Upload > Selecione `saladesenho.glb`
   - Aguarde upload

4. **Copiar URL pública:**
   - Clique no arquivo
   - Copie a "Public URL"
   - Será algo como: `https://pub-xxxxx.r2.dev/saladesenho.glb`

5. **Configurar na Vercel:**
   - Mesmos passos do Passo 2 acima
   - Use a URL do Cloudflare R2

---

## ⚠️ IMPORTANTE

**NÃO** deixe o site no ar sem configurar a variável `VITE_GLB_URL`!

Atualmente o site está tentando carregar:
```
https://novonoah.vercel.app/models/saladesenho.glb
```

Mas esse arquivo não existe no deploy da Vercel (é muito grande).

Depois de configurar `VITE_GLB_URL`, o site vai carregar de:
```
https://github.com/.../saladesenho.glb  (ou Cloudflare R2)
```

---

## 🧪 Teste Local

Se quiser testar localmente com a URL do CDN:

1. Crie um arquivo `.env.local`:
   ```bash
   VITE_GLB_URL=https://github.com/NeuTr0n244/noah-01/releases/download/v1.0.0/saladesenho.glb
   ```

2. Rode o servidor:
   ```bash
   npm run dev
   ```

3. O modelo deve carregar do GitHub Releases em vez do arquivo local

---

## ✅ Checklist Rápido

- [ ] Criar release no GitHub (v1.0.0)
- [ ] Upload do saladesenho.glb (172MB)
- [ ] Copiar URL do asset
- [ ] Configurar VITE_GLB_URL na Vercel
- [ ] Redeploy forçado na Vercel
- [ ] Testar site: https://novonoah.vercel.app
- [ ] Verificar console do navegador (F12)

**Tempo estimado**: 10-15 minutos (incluindo uploads)

---

## 📞 Suporte

Se tiver problemas:

1. **Modelo não carrega**: Verifique se VITE_GLB_URL está configurado corretamente
2. **Erro CORS**: Certifique-se que o bucket/release é público
3. **Erro 404**: Verifique se a URL está correta (sem espaços, case-sensitive)

**GitHub Repo**: https://github.com/NeuTr0n244/noah-01
**Vercel Dashboard**: https://vercel.com/vito01hugo02-9635s-projects/novonoah
