# 🚀 Deploy Instructions - Noah Universe

## ✅ STATUS ATUAL

- ✅ **Código no GitHub**: https://github.com/NeuTr0n244/noah-01
- ✅ **Deploy na Vercel**: https://novonoah.vercel.app
- ⚠️ **Domínio customizado**: Precisa configurar
- ⚠️ **Modelo 3D (GLB)**: Precisa hospedar em CDN

---

## 📦 PASSO 1: Hospedar o Modelo GLB

O arquivo `saladesenho.glb` (172MB) não pode ficar no repositório devido aos limites do GitHub e Vercel.

### Opção A: GitHub Releases (Recomendado - Gratuito)

1. Acesse: https://github.com/NeuTr0n244/noah-01/releases/new
2. Preencha:
   - **Tag version**: `v1.0.0`
   - **Release title**: `Assets v1.0.0`
   - **Description**: `3D model assets for Noah Universe`
3. Arraste o arquivo `saladesenho.glb` da pasta `public/models/` (se ainda tiver localmente)
   - **Localização local**: `C:\Users\NEUTRON\Documents\novonoah\public\models\saladesenho.glb`
   - Se não tiver mais, pode precisar recuperar de um backup
4. Clique em "Publish release"
5. Copie a URL do asset (será algo como):
   ```
   https://github.com/NeuTr0n244/noah-01/releases/download/v1.0.0/saladesenho.glb
   ```

### Opção B: Cloudflare R2 (Alternativa - Gratuito até 10GB)

1. Crie conta em: https://dash.cloudflare.com/sign-up
2. Vá em R2 Object Storage
3. Crie um bucket público
4. Faça upload do arquivo GLB
5. Copie a URL pública do arquivo

### Opção C: Vercel Blob (Pago - mais simples mas $$$)

```bash
npm i -g @vercel/blob
vercel blob upload public/models/saladesenho.glb --token=YOUR_TOKEN
```

---

## 🌐 PASSO 2: Configurar Variável de Ambiente na Vercel

Depois de hospedar o GLB, configure a URL na Vercel:

### Via Dashboard (Recomendado):
1. Acesse: https://vercel.com/vito01hugo02-9635s-projects/novonoah/settings/environment-variables
2. Adicione uma nova variável:
   - **Key**: `VITE_GLB_URL`
   - **Value**: (URL do CDN do passo anterior)
   - **Environments**: Production, Preview, Development
3. Clique em "Save"
4. Faça um novo deploy:
   ```bash
   vercel --prod
   ```

### Via CLI:
```bash
vercel env add VITE_GLB_URL production
# Cole a URL do CDN quando solicitado
```

---

## 🌍 PASSO 3: Configurar Domínio noahverse.xyz

### Remover domínio do projeto antigo:

1. Acesse o dashboard da Vercel: https://vercel.com/dashboard
2. Encontre o projeto antigo que usa `noahverse.xyz`
3. Vá em Settings > Domains
4. Remova o domínio `noahverse.xyz`

### Adicionar ao novo projeto:

#### Opção A - Via Dashboard:
1. Acesse: https://vercel.com/vito01hugo02-9635s-projects/novonoah/settings/domains
2. Clique em "Add Domain"
3. Digite: `noahverse.xyz`
4. Clique em "Add"

#### Opção B - Via CLI:
```bash
vercel domains add noahverse.xyz
```

### Configurar DNS:

Após adicionar o domínio, a Vercel vai mostrar instruções de DNS. Configure no seu provedor de domínio:

#### Para domínio raiz (noahverse.xyz):
```
Tipo: A
Nome: @
Valor: 76.76.21.21
```

#### Para www (www.noahverse.xyz):
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

**Aguarde a propagação do DNS** (pode levar até 48h, mas geralmente 5-30 minutos).

---

## 🔄 PASSO 4: Testar o Site

1. Acesse: https://novonoah.vercel.app
2. Depois que o DNS propagar: https://noahverse.xyz
3. Verifique se:
   - ✅ Site carrega
   - ✅ Modelo 3D aparece (pode demorar alguns segundos - 172MB)
   - ✅ UI overlay funciona
   - ✅ Chat funciona
   - ✅ Navegação funciona
   - ✅ Mobile está responsivo

---

## 🛠️ Comandos Úteis

### Deploy manual:
```bash
vercel --prod
```

### Ver logs:
```bash
vercel logs novonoah
```

### Ver deployments:
```bash
vercel ls
```

### Ambiente de preview:
```bash
vercel
```

---

## 📝 Atualizações Futuras

Para fazer mudanças no site:

```bash
# 1. Faça suas alterações no código
# 2. Commite e push
git add .
git commit -m "sua mensagem"
git push origin main

# 3. Vercel faz deploy automático!
```

A Vercel detecta automaticamente pushes no GitHub e faz deploy.

---

## ⚠️ Troubleshooting

### Modelo 3D não carrega:
- Verifique se a variável `VITE_GLB_URL` está configurada
- Verifique se a URL do CDN está acessível
- Abra o Console do navegador (F12) e veja erros
- O modelo é grande (172MB), pode demorar para carregar

### Domínio não funciona:
- Aguarde propagação do DNS (até 48h)
- Verifique registros DNS com: https://dnschecker.org/#A/noahverse.xyz
- Certifique-se de que removeu do projeto antigo primeiro

### Build error:
- Verifique os logs: `vercel logs`
- Tente rebuild: `npm run build` localmente
- Veja erros no dashboard: https://vercel.com/vito01hugo02-9635s-projects/novonoah

### Server error (server.js):
- O server.js NÃO roda na Vercel (é para desenvolvimento local com Socket.io)
- A Vercel serve apenas os arquivos estáticos do build
- Para funcionalidades de chat em tempo real, você precisaria de um servidor separado

---

## 📚 Recursos

- **GitHub Repo**: https://github.com/NeuTr0n244/noah-01
- **Vercel Dashboard**: https://vercel.com/vito01hugo02-9635s-projects/novonoah
- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev

---

## 🎯 Resumo Rápido

1. ✅ Código no GitHub
2. ✅ Deploy na Vercel (https://novonoah.vercel.app)
3. ⏳ Hospedar GLB no CDN (GitHub Releases ou Cloudflare R2)
4. ⏳ Configurar variável VITE_GLB_URL na Vercel
5. ⏳ Configurar domínio noahverse.xyz
6. ⏳ Configurar DNS A/CNAME
7. ✅ Testar site

**Próximos passos**: Complete os itens ⏳ acima para finalizar o deploy!
