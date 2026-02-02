**Choix d’Architecture et outils:**

Next.js + Edge Runtime : Minimise latence pour le chat en exécutant le code au plus près du user

Supabase: Intégrer rapidement une base de données et l’authentification sans avoir à gérer un back séparé.

Tailwind CSS + Lucide: Classes et icônes faciles à récupérer et intégrer
Gemini (via @google/genai): gestion des sessions facilitée, streaming de la réponse, clés API gratuites

**Structure src/ :**
/app: logiques de routage
/components: blocs UI réutilisables
/context: gère état global pour faciliter l'accès aux données dans l’app
/lib : configuration externe (ici pour client supabase)

**Ameliorations futures:**

- Encart texte chat: enlever le scroll direct, mieux gérer la hauteur et le centrage quand plusieurs lignes
- Réponse LLM : Éviter que le bloc de fond ne fasse que suivre les messages (s’agrandit trop brusquement) → Enlever les blocs ?
- Permettre de garder le chat actuel si on sign up (pour le moment tout chat écrit en tant que guest est perdu)
- Meilleure gestion des events quand la LLM écrit/réfléchit
- Version mobile: enlever hook en dessous de la sidebar quand ouverte
- ...