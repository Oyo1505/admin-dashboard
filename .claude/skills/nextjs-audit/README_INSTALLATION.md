# Installation du Skill dans Claude Code

## Structure du Skill

```
nextjs-audit/
├── SKILL.md                                    # Configuration principale
├── scripts/
│   ├── check_accessibility.py                  # Audit accessibilité automatique
│   └── analyze_performance.py                  # Analyse performance automatique
└── references/
    ├── accessibility_standards.md              # Guide WCAG 2.1 AA / RGAA 4.1
    └── nextjs_performance.md                   # Guide optimisation Next.js 14+
```

## Installation

### Méthode 1 : Via le dossier complet (Recommandé pour Claude Code)

1. Récupère le dossier `nextjs-audit/`
2. Place-le dans ton répertoire de skills Claude Code
3. Le skill sera automatiquement chargé

### Méthode 2 : Via le fichier .skill (Pour Claude.ai)

1. Télécharge `nextjs-audit.skill`
2. Va dans Settings > Skills
3. Importe le fichier

## Vérification

Tous les fichiers essentiels sont présents :

✅ **SKILL.md** (4.5KB)
- Frontmatter YAML avec name et description
- Workflow d'audit structuré
- Instructions d'utilisation des scripts et références

✅ **scripts/check_accessibility.py** (13KB)
- Scanner automatique JSX/TSX
- Détection WCAG 2.1 AA / RGAA 4.1
- Génération de rapport détaillé

✅ **scripts/analyze_performance.py** (16KB)
- Analyse images, fonts, bundle
- Détection Server/Client Components
- Vérification configuration Next.js

✅ **references/accessibility_standards.md** (9.5KB)
- Guide complet WCAG/RGAA
- Exemples de code
- Checklist de tests

✅ **references/nextjs_performance.md** (13KB)
- Patterns d'optimisation
- Core Web Vitals
- Anti-patterns Next.js

## Utilisation dans Claude Code

Une fois installé, tu peux utiliser le skill directement en CLI :

```bash
# Audit complet
claude "Audite mon projet Next.js dans ./my-project"

# Accessibilité uniquement
claude "Lance check_accessibility.py sur ./my-project"

# Performance uniquement
claude "Analyse les performances de ./my-project"
```

Le skill se déclenchera automatiquement quand tu mentionnes :
- "audit Next.js"
- "accessibilité"
- "performance Next.js"
- "WCAG" / "RGAA"

## Scripts Python

Les scripts sont exécutables directement :

```bash
# Accessibilité
python3 scripts/check_accessibility.py /path/to/project

# Performance
python3 scripts/analyze_performance.py /path/to/project
```

## Prêt à l'emploi ! 🚀

Le skill est complet et fonctionnel pour Claude Code.
