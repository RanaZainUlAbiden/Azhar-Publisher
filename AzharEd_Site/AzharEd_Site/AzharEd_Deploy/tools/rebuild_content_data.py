#!/usr/bin/env python3
"""
AzharEd content auto-indexer
============================
Scans the class folders (e.g. "GoldCrest Playgroup", "Panda Prep") and rebuilds
content_data.js automatically. Run it whenever you add, rename or remove books,
decks, flipbooks, interactives or exam papers — the website updates itself.

Usage (from the AzharEd_Deploy folder):
    python3 tools/rebuild_content_data.py            # rewrites content_data.js
    python3 tools/rebuild_content_data.py --check    # dry run: shows what would change

Folder rules it understands
---------------------------
<Series> <Level>/                e.g. "Panda Nursery"
    Decks/          <Series>_<Subject>_<Level>_Overview.pdf|pptx
    Flipbooks/      <Series>_<Subject>_<Level>_Flipbook.html
    Interactives/   <Series>_<Subject>_<Level>_Interactive.html
    Papers & Books/ <Series>_<Subject>_<Level>_<Paper Name>.pdf
                    (a file ending _00_Cover.pdf becomes the book cover)
assets/covers/<series>_<level>_<subject>.jpg   -> used as the card cover image

A "book" is created for every unique (Series, Level, Subject) found in any of
the four subfolders. Multi-word subjects (General_Knowledge) work fine.
"""
import json, os, re, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEVELS = ["Playgroup", "Nursery", "Prep",
          "One", "Two", "Three", "Four", "Five"]   # order shown in the app
SUBJECT_ORDER = ["Counting", "English", "Urdu", "Tables",
                 "General Knowledge", "General Knowledge C",
                 "Nursery Rhymes Book1", "Nursery Rhymes Book2",
                 "Easy Draw and Colour A", "Easy Draw and Colour B",
                 "Science Introductory", "Computer Introductory",
                 "Social Studies Introductory",
                 "Islamiyat", "Islamiyat PCTB", "Islamiyat DCTE",
                 "Waqfeat e Aama", "Social Studies"]
ICONS = {"Counting": "🔢", "English": "🔤", "Urdu": "✍️", "Tables": "✖️",
         "General Knowledge": "🌍", "General Knowledge C": "🌏",
         "Maths": "➗", "Science": "🔬",
         "Nursery Rhymes Book1": "🎵", "Nursery Rhymes Book2": "🎶",
         "Easy Draw and Colour A": "🎨", "Easy Draw and Colour B": "🖍️",
         "Science Introductory": "🔬", "Computer Introductory": "💻",
         "Social Studies Introductory": "🗺️",
         "Islamiyat PCTB": "🕌", "Islamiyat DCTE": "🕌",
         "Waqfeat e Aama": "🌍", "Social Studies": "🗺️"}
# Proper display titles ("Panda " + value). Files without a real title get one here.
TITLE_OVERRIDES = {"Urdu": "Urdu Qaida", "Tables": "Table Book",
                   "General Knowledge C": "Young Learners\u2019 General Knowledge — C",
                   "Nursery Rhymes Book1": "Nursery Rhymes Book 1",
                   "Nursery Rhymes Book2": "Nursery Rhymes Book 2",
                   "Easy Draw and Colour A": "Easy Draw & Colour — Step A",
                   "Easy Draw and Colour B": "Easy Draw & Colour — Step B",
                   "Science Introductory": "Primary Science — Introductory Book",
                   "Computer Introductory": "Junior\u2019s Computer Series — Introductory Book",
                   "Social Studies Introductory": "Social Studies — Introductory Book"}
# Per-series title overrides (checked before TITLE_OVERRIDES)
SERIES_TITLES = {"Panda": {
    "General Knowledge": "Young Learners’ General Knowledge — A"},
  "Alfatah": {
    "Urdu": "Urdu Reader",
    "Islamiyat PCTB": "Islamiyat — Punjab (PCTB) Edition",
    "Islamiyat DCTE": "Islamiyat — Federal (DCTE) Edition",
    "Waqfeat e Aama": "Waqfeat-e-Aama — General Knowledge (Urdu)",
    "Social Studies": "Social Studies Book"}}
# Library filter group shown as the book's subject chip
FILTER_GROUP = {"General Knowledge C": "General Knowledge",
                "Islamiyat PCTB": "Islamiyat", "Islamiyat DCTE": "Islamiyat",
                "Waqfeat e Aama": "General Knowledge",
                "Nursery Rhymes Book1": "Rhymes", "Nursery Rhymes Book2": "Rhymes",
                "Easy Draw and Colour A": "Art", "Easy Draw and Colour B": "Art",
                "Science Introductory": "Science", "Computer Introductory": "Computer",
                "Social Studies Introductory": "Social Studies"}
AGES = {"Playgroup": "Age 3+", "Nursery": "Age 3+", "Prep": "Age 3+",
        "One": "Class 1", "Two": "Class 2", "Three": "Class 3",
        "Four": "Class 4", "Five": "Class 5"}
TYPE_WORDS = {"Flipbook", "Interactive", "Overview"}


def find_class_dirs():
    out = []
    for d in sorted(os.listdir(ROOT)):
        p = os.path.join(ROOT, d)
        if os.path.isdir(p) and os.path.isdir(os.path.join(p, "Flipbooks")):
            parts = d.split()
            if len(parts) >= 2 and parts[-1] in LEVELS:
                out.append((d, " ".join(parts[:-1]), parts[-1]))  # dir, series, level
    return out


def parse_name(fname, series, level):
    """Split Series_Subject..._Level_Rest -> (subject, rest).
    Files without the level token (e.g. Panda_Science_Introductory_Flipbook.html)
    fall back to Series_Subject..._Type — the folder supplies the level."""
    stem = os.path.splitext(fname)[0]
    toks = stem.split("_")
    s_tok, l_low = series.replace(" ", ""), level.lower()
    if not toks or toks[0].lower() != s_tok.lower():
        return None
    try:
        li = next(i for i, t in enumerate(toks) if t.lower() == l_low and i >= 2)
        return " ".join(toks[1:li]), " ".join(toks[li + 1:])
    except StopIteration:
        pass
    if len(toks) >= 3 and toks[-1] in TYPE_WORDS:      # level-less naming
        return " ".join(toks[1:-1]), toks[-1]
    return None


def paper_sort_key(label):
    l = label.lower()
    if "content" in l:
        return (0, 0, 0, label)
    m = re.match(r"monthly test (\d+)", l)
    if m:
        return (1, int(m.group(1)), 0, label)
    m = re.match(r"(\d)(?:st|nd|rd|th) term", l)
    if m:
        return (2, int(m.group(1)), 0 if "sheet" in l else 1, label)
    if "final term" in l:
        return (2, 9, 0 if "sheet" in l else 1, label)
    for i, tail in enumerate(["annual", "all tests", "booklet"]):
        if tail in l:
            return (3, i, 0, label)
    return (4, 0, 0, label)


def build():
    books = {}
    series_seen, class_dirs = [], find_class_dirs()

    def key(series, level, subject):
        return (series, level, subject)

    def get_book(series, level, subject):
        k = key(series, level, subject)
        if k not in books:
            bid = ("%s_%s_%s" % (series, level, subject)).lower().replace(" ", "_")
            title_part = SERIES_TITLES.get(series, {}).get(
                subject, TITLE_OVERRIDES.get(subject, subject + " Book"))
            cover_rel = "assets/covers/%s.jpg" % bid
            books[k] = {
                "id": bid, "series": series, "level": level,
                "subject": FILTER_GROUP.get(subject, subject),
                "title": "%s %s" % (series, title_part), "titleSource": "deck",
                "coverImg": cover_rel if os.path.isfile(os.path.join(ROOT, cover_rel)) else None,
                "age": AGES.get(level, "Early Years"), "icon": ICONS.get(subject, "📘"),
                "flipbook": None, "interactive": None, "deck": None, "deckPdf": None,
                "cover": None, "papers": [], "paperCount": 0,
            }
        return books[k]

    for d, series, level in class_dirs:
        if series not in series_seen:
            series_seen.append(series)
        base = os.path.join(ROOT, d)

        for sub, field, ext in [("Flipbooks", "flipbook", ".html"),
                                ("Interactives", "interactive", ".html")]:
            p = os.path.join(base, sub)
            if not os.path.isdir(p):
                continue
            for f in sorted(os.listdir(p)):
                if not f.lower().endswith(ext):
                    continue
                parsed = parse_name(f, series, level)
                if parsed:
                    get_book(series, level, parsed[0])[field] = "%s/%s/%s" % (d, sub, f)

        deck_dir = os.path.join(base, "Decks")
        if os.path.isdir(deck_dir):
            decks = {}
            for f in sorted(os.listdir(deck_dir)):
                if f.lower().endswith((".pdf", ".pptx")):
                    parsed = parse_name(f, series, level)
                    if parsed:
                        decks.setdefault(parsed[0], {})[os.path.splitext(f)[1].lower()] = f
            for subject, files in decks.items():
                b = get_book(series, level, subject)
                pdf, pptx = files.get(".pdf"), files.get(".pptx")
                b["deck"] = "%s/Decks/%s" % (d, pdf or pptx) if (pdf or pptx) else None
                b["deckPdf"] = "%s/Decks/%s" % (d, pdf) if pdf else None

        pap_dir = os.path.join(base, "Papers & Books")
        if os.path.isdir(pap_dir):
            for f in sorted(os.listdir(pap_dir)):
                if not f.lower().endswith(".pdf"):
                    continue
                parsed = parse_name(f, series, level)
                if not parsed:
                    continue
                subject, rest = parsed
                b = get_book(series, level, subject)
                path = "%s/Papers & Books/%s" % (d, f)
                label = re.sub(r"^00\s+", "", rest).strip()
                if rest.lower().endswith("cover") and rest.lower().startswith("00"):
                    b["cover"] = path
                elif label:
                    b["papers"].append({"label": label, "path": path})

    for b in books.values():
        b["papers"].sort(key=lambda p: paper_sort_key(p["label"]))
        b["paperCount"] = len(b["papers"])

    def subject_rank(s):
        return (SUBJECT_ORDER.index(s), "") if s in SUBJECT_ORDER else (len(SUBJECT_ORDER), s)

    SERIES_ORDER = ["GoldCrest", "Panda", "Alfatah"]
    series_seen.sort(key=lambda x: SERIES_ORDER.index(x) if x in SERIES_ORDER else 99)
    # similar books together: series -> subject -> level
    ordered = sorted(books.values(), key=lambda b: (
        series_seen.index(b["series"]), subject_rank(b["subject"]), LEVELS.index(b["level"])))

    return {
        "generated": datetime.date.today().isoformat(),
        "publisher": "Azhar Publishers",
        "levels": LEVELS, "series": series_seen, "books": ordered,
    }


def main():
    manifest = build()
    n_books = len(manifest["books"])
    n_papers = sum(b["paperCount"] for b in manifest["books"])
    out = "// Auto-generated content manifest for AzharEd — do not edit by hand.\n" \
          "// Rebuild with: python3 tools/rebuild_content_data.py\n" \
          "window.AZHAR_CONTENT = " + json.dumps(manifest, indent=1, ensure_ascii=False) + ";\n"
    target = os.path.join(ROOT, "content_data.js")

    if "--check" in sys.argv:
        old = open(target, encoding="utf-8").read() if os.path.isfile(target) else ""
        print("Would write %d books, %d papers." % (n_books, n_papers))
        print("content_data.js would %s." % ("change" if old != out else "stay the same"))
        return

    # basic sanity: refuse to wipe a healthy manifest down to nothing
    if n_books == 0:
        sys.exit("No books found — are you running this inside the AzharEd_Deploy folder?")
    missing = [b["id"] for b in manifest["books"] if not (b["flipbook"] or b["deck"])]
    if missing:
        print("⚠️  Books with no flipbook AND no deck (check filenames):", ", ".join(missing))

    with open(target, "w", encoding="utf-8") as fh:
        fh.write(out)
    print("✅ content_data.js rebuilt: %d books, %d exam papers." % (n_books, n_papers))


if __name__ == "__main__":
    main()
