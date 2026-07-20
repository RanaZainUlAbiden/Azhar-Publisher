#!/usr/bin/env python3
"""
AzharEd book question-bank extractor
====================================
Reads every book's Interactive HTML (the page-by-page activities), converts each
activity into a printable exam question, and writes question_bank.js.
The Paper Generator uses this so papers are tailored to the actual book pages.

Run after adding/updating interactives (from the AzharEd_Deploy folder):
    python3 tools/build_question_bank.py
"""
import json, os, random, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_manifest():
    src = open(os.path.join(ROOT, "content_data.js"), encoding="utf-8").read()
    start = src.index("{", src.index("window.AZHAR_CONTENT"))
    end = src.rindex("}")
    return json.loads(src[start:end + 1])


def extract_meta(path):
    src = open(path, encoding="utf-8").read()
    i = src.find("const META = ")
    if i < 0:
        return None
    j = src.index("{", i)
    depth, k = 0, j
    while k < len(src):
        c = src[k]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                break
        k += 1
    try:
        return json.loads(src[j:k + 1])
    except Exception:
        return None


def extract_act(path):
    """Parse `const ACT=[...]` (Al-Fatah interactives). Returns list or None."""
    src = open(path, encoding="utf-8").read()
    i = src.find("const ACT=")
    if i < 0:
        return None
    i = src.index("[", i)
    depth, instr, esc = 0, False, False
    for k in range(i, len(src)):
        c = src[k]
        if instr:
            if esc: esc = False
            elif c == "\\": esc = True
            elif c == '"': instr = False
            continue
        if c == '"': instr = True
        elif c in "[{": depth += 1
        elif c in "]}":
            depth -= 1
            if depth == 0:
                break
    try:
        return json.loads(src[i:k + 1])
    except Exception:
        return None


def convert_act(idx, a):
    """One Al-Fatah ACT item -> printable question. Chapter name doubles as page tag."""
    t, ch = a.get("type"), a.get("ch") or ""
    q = (a.get("q") or "").strip()
    if t == "mcq":
        opts, c = a.get("opts") or [], a.get("c", 0)
        if not q or not opts:
            return None
        return {"pg": idx, "pt": ch, "k": "mcq", "text": q, "options": opts,
                "answer": opts[c] if 0 <= c < len(opts) else ""}
    if t == "tf":
        ans = a.get("a")
        if not q or ans is None:
            return None
        return {"pg": idx, "pt": ch, "k": "mcq", "text": q,
                "options": ["\u062f\u0631\u0633\u062a", "\u063a\u0644\u0637"],
                "answer": "\u062f\u0631\u0633\u062a" if ans in (True, "true", 1, "T") else "\u063a\u0644\u0637"}
    if t == "match":
        pairs = a.get("pairs") or []
        if len(pairs) < 2:
            return None
        return {"pg": idx, "pt": ch, "k": "match", "text": q or "\u062c\u0648\u0691 \u0645\u0644\u0627\u0626\u06cc\u06ba", "pairs": pairs}
    if t == "fill":
        ans = a.get("a") or a.get("answer") or ""
        if not q:
            return None
        return {"pg": idx, "pt": ch, "k": "short", "text": q, "answer": str(ans)}
    if t in ("order", "sort"):
        items = [str(x) for x in (a.get("items") or a.get("opts") or [])]
        if len(items) < 2:
            return None
        return {"pg": idx, "pt": ch, "k": "short",
                "text": (q or "\u062f\u0631\u0633\u062a \u062a\u0631\u062a\u06cc\u0628 \u0644\u06a9\u06be\u06cc\u06ba") + ":  " + "  \u060c  ".join(items),
                "answer": " \u060c ".join(items)}
    return None


def convert(pg, pt, a):
    """Convert one interactive activity into a printable question (or None)."""
    t = a.get("type")
    label = (a.get("label") or "").strip()
    if t in ("tick", "story_qa"):
        opts = a.get("options") or a.get("opts") or []
        ci = a.get("correct", 0)
        text = a.get("q") or label
        if not opts or not text:
            return None
        return {"pg": pg, "pt": pt, "k": "mcq", "text": text, "options": opts,
                "answer": opts[ci] if 0 <= ci < len(opts) else ""}
    if t == "match":
        pairs = a.get("pairs") or []
        if len(pairs) < 2:
            return None
        return {"pg": pg, "pt": pt, "k": "match", "text": label or "Match the columns",
                "pairs": pairs}
    if t == "match_caps":
        caps, smalls = a.get("caps") or [], a.get("smalls") or []
        if len(caps) < 2 or len(caps) != len(smalls):
            return None
        return {"pg": pg, "pt": pt, "k": "match", "text": label or "Match capital and small letters",
                "pairs": [[c, s] for c, s in zip(caps, smalls)]}
    if t in ("missing_type", "missing_type_caps"):
        seq = a.get("seq") or []
        answers = a.get("answers") or []
        if not seq:
            return None
        shown = " , ".join("____" if x is None else str(x) for x in seq)
        return {"pg": pg, "pt": pt, "k": "short", "text": (label or "Fill in the missing items") + ":  " + shown,
                "answer": " , ".join(answers)}
    if t == "ordering":
        items = [str(x) for x in a.get("items") or []]
        if len(items) < 3:
            return None
        shuf = items[:]
        rnd = random.Random(pt + str(pg))
        while shuf == items:
            rnd.shuffle(shuf)
        return {"pg": pg, "pt": pt, "k": "short",
                "text": (label or "Write these in the correct order") + ":  " + "  ,  ".join(shuf),
                "answer": " , ".join(items)}
    if t == "find_circle":
        items = a.get("items") or []
        targets = a.get("targets") or []
        if not items or not targets:
            return None
        return {"pg": pg, "pt": pt, "k": "short",
                "text": (label or "Circle the target") + ":   " + "   ".join(items),
                "answer": " , ".join(targets)}
    if t == "first_letter_type":
        pics = (a.get("pics") or [])[:6]
        if not pics:
            return None
        shown = "    ".join("%s (%s) = ____" % (p.get("e", ""), p.get("name", "")) for p in pics)
        return {"pg": pg, "pt": pt, "k": "short",
                "text": (label or "Write the first letter of each picture") + ":   " + shown,
                "answer": " , ".join(p.get("l", "") for p in pics)}
    if t == "article_pick":
        items = (a.get("items") or [])[:6]
        if not items:
            return None
        shown = "    ".join("____ %s %s" % (i.get("w", ""), i.get("e", "")) for i in items)
        return {"pg": pg, "pt": pt, "k": "short",
                "text": (label or "Write A or AN") + ":   " + shown,
                "answer": " , ".join(i.get("a", "") for i in items)}
    if t == "type_letter":
        seq = a.get("seq") or []
        if not seq:
            return None
        return {"pg": pg, "pt": pt, "k": "short",
                "text": (label or "Write the letters in order") + "  (%s … %s)" % (seq[0], seq[-1]),
                "answer": " ".join(seq)}
    if t == "rhyme":
        lines = a.get("lines") or []
        if len(lines) < 2:
            return None
        return {"pg": pg, "pt": pt, "k": "short",
                "text": "نظم کی اگلی سطر مکمل کریں:  «" + lines[0] + "»  …",
                "answer": lines[1]}
    return None  # pd, form_fill, finale — hands-on activities, not testable on paper


def main():
    manifest = load_manifest()
    bank, total = {}, 0
    for b in manifest["books"]:
        inter = b.get("interactive")
        if not inter:
            continue
        path = os.path.join(ROOT, inter)
        if not os.path.isfile(path):
            continue
        meta = extract_meta(path)
        if not meta:
            act = extract_act(path)
            if act:
                items, chs = [], []
                for a in act:
                    ch = a.get("ch") or ""
                    if ch not in chs:
                        chs.append(ch)
                    qq = convert_act(chs.index(ch) + 1, a)
                    if qq:
                        items.append(qq)
                if items:
                    bank[b["id"]] = {"title": b["title"], "level": b["level"],
                                     "pages": len(chs), "items": items, "unit": "chapter"}
                    total += len(items)
                    print("  %-38s %3d chapters %3d questions" % (b["id"], len(chs), len(items)))
            continue
        items = []
        for pg in sorted(meta.keys(), key=lambda x: int(x) if x.isdigit() else 0):
            page = meta[pg]
            pt = page.get("title") or ""
            for a in page.get("activities") or []:
                q = convert(int(pg) if pg.isdigit() else 0, pt, a)
                if q:
                    items.append(q)
        if items:
            bank[b["id"]] = {"title": b["title"], "level": b["level"],
                             "pages": len(meta), "items": items}
            total += len(items)
            print("  %-38s %3d pages  %3d questions" % (b["id"], len(meta), len(items)))
    out = ("// Auto-generated book question bank for AzharEd — do not edit by hand.\n"
           "// Rebuild with: python3 tools/build_question_bank.py\n"
           "window.AZHAR_QBANK = " + json.dumps(bank, ensure_ascii=False) + ";\n")
    with open(os.path.join(ROOT, "question_bank.js"), "w", encoding="utf-8") as fh:
        fh.write(out)
    print("✅ question_bank.js written: %d books, %d questions." % (len(bank), total))


if __name__ == "__main__":
    main()
