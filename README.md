<div align="center">

# Join

</div>

<div align="center">

![Lernprojekt](https://img.shields.io/badge/Lernprojekt-Frontend-00939b?style=for-the-badge)
<img width="12" />
![Projektstatus](https://img.shields.io/badge/Projektstatus-ongoing-f221e4?style=for-the-badge)

</div>

<div align="center">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" height="40" alt="html5 logo"  />
    <img width="12" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="40" alt="javascript logo"  />
    <img width="12" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" height="40" alt="css3 logo" />

</div>
<img/>

<div align="center">

🌐 Live-Ansicht des Projekts: 👉 [GitHub Pages](https://romanbuchdev.github.io/Join/)

</div>

## 👩‍💻 Contributors

- **Alex Epp** (GitHub: [AlexEppDev](https://github.com/AlexEppDev))
- **Elena Hiener** (GitHub: [ElenaH-2026](https://github.com/ElenaH-2026))
- **Roman Buchmüller** (GitHub: [RomanbuchDev](https://github.com/RomanbuchDev))
- **Timo Indlekofer** (GitHub: [TimoIndlekofer](https://github.com/TimoIndlekofer))

## 📋 Projektregeln

### Beispiel:

Feature-Branch:

```text
feat/5-contacts-basic-structure
```

Commit:

```text
"feat: issue 5: Add page structure in contacts.html"
```

### Übersicht:

| Featurebranch    | Commit Präfix | Anwendung                                                  |
| ---------------- | ------------- | ---------------------------------------------------------- |
| `feat/#-...`     | `feat:`       | neue Funktion hinzufügen                                   |
| `fix/#-...`      | `fix:`        | Fehler beheben                                             |
| `docs/#-...`     | `docs:`       | README oder Dokumentation ändern                           |
| `style/#-...`    | `style:`      | nur Formatierung ändern, ohne die Funktion zu verändern    |
| `refactor/#-...` | `refactor:`   | bestehenden Code verbessern oder umbauen                   |
| `chore/#-...`    | `chore:`      | Ordner, Dateien, Konfiguration oder Projektstruktur ändern |
| `test/#-...`     | `test:`       | Tests hinzufügen oder ändern                               |

## 📑 Inhaltsverzeichnis

🚀 [Quickstart](#-quickstart)

🗂️ [Projektstruktur](#-projektstruktur)

📝 [Disclaimer](#-disclaimer)

## 🚀 Quickstart

1. Repository klonen mit SSH:

```bash
git clone git@github.com:RomanbuchDev/Join.git
```

2. Oder: Repository klonen mit HTTPS:

```bash
git clone https://github.com/RomanbuchDev/Join.git
```

3. In das Verzeichnis wechseln:

```bash
cd Join
```

4. Installiere die Abhaengigkeiten:

```bash
npm install
```

5. Starte deinen lokalen Entwicklungsserver:

```text
z.B. Live Server in VS Code
```

6. Öffne danach die URL im Browser auf deinem Computer:

```text
http://localhost:<live-server-port>
```

7. Oder öffne die URL im Browser auf deiner virtuellen Maschine:

```text
http://<deine_ip>:<live-server-port>
```

## 📁 Projektstruktur

```text
.
│   .gitignore
│   README.md
│   LICENSE.md
│   package.json
│   package-lock.json
│   index.html  --> Alex
│   style.css
│   script.js
│
├───.github/workflows/
│       code-quality.yml
│       deploy-ftp.yml
│
├───node_modules/ (-> .gitignore)
│
├───quality/
│
├───assets/
│   ├───fonts/
│   └───icons/
│       .DS_Store (-> .gitignore - Was ist das nochmal??)
│
├───html/
│       add-task.html
│       board.html --> Elena
│       contact.html --> Timo
│       greeting-page.html  --> Alex
│       imprint.html --> Roman
│       privacy-policy.html
│       signup.html  --> Alex
│       summary.html  --> Roman
│
├───css/
│
└───js/


```

## 📝 Disclaimer

> [!NOTE]
> Dieses Projekt ist ein reines Übungsprojekt und ist zu Lernzwecken im Zuge unserer Weiterbildung bei der [Developer Akademie](https://developerakademie.com) entstanden.
