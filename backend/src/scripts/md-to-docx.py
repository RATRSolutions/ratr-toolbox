"""
md-to-docx converter
Tom Nordgård — 2026

Converts a Markdown file into a Word document using an existing DOCX template.
No external dependencies — Python standard library only.

Usage:
    python convert.py <input.md> <template.docx> <output.docx>

Example:
    python convert.py rapport.md Report_Template.docx rapport.docx
"""

import re
import sys
import shutil
import random
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


# ── ID generation ─────────────────────────────────────────────────────────────
# paraId must be < 0x80000000 per OOXML spec

_rng = random.Random(42)

def new_para_id():
    val = _rng.randint(0x00100000, 0x7FFFFF00)
    return f'{val:08X}'


# ── XML helpers ───────────────────────────────────────────────────────────────

def escape_xml(text):
    return (text
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;'))

def strip_numbering(text):
    """Remove leading chapter numbers: '1. Formål' → 'Formål'."""
    return re.sub(r'^\d+(\.\d+)*\.?\s+', '', text)


# ── Paragraph builders ────────────────────────────────────────────────────────

def make_normal_para(runs_xml):
    pid = new_para_id()
    return (
        f'<w:p w14:paraId="{pid}" w14:textId="77777777" '
        f'w:rsidR="00CC0000" w:rsidRDefault="00CC0000">'
        f'<w:pPr><w:spacing w:after="160" w:line="278" w:lineRule="auto"/></w:pPr>'
        f'{runs_xml}</w:p>'
    )

def make_heading_para(text_xml, level):
    pid = new_para_id()
    return (
        f'<w:p w14:paraId="{pid}" w14:textId="77777777" '
        f'w:rsidR="00CC0000" w:rsidRDefault="00CC0000">'
        f'<w:pPr><w:pStyle w:val="Heading{level}"/></w:pPr>'
        f'<w:r><w:t xml:space="preserve">{text_xml}</w:t></w:r>'
        f'</w:p>'
    )

def make_bullet_para(runs_xml):
    """Uses numId=2 from the template (filled circle, Symbol font)."""
    pid = new_para_id()
    return (
        f'<w:p w14:paraId="{pid}" w14:textId="77777777" '
        f'w:rsidR="00CC0000" w:rsidRDefault="00CC0000">'
        f'<w:pPr>'
        f'<w:pStyle w:val="ListParagraph"/>'
        f'<w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>'
        f'<w:spacing w:after="80" w:line="278" w:lineRule="auto"/>'
        f'</w:pPr>'
        f'{runs_xml}</w:p>'
    )

def make_page_break():
    pid = new_para_id()
    return (
        f'<w:p w14:paraId="{pid}" w14:textId="77777777" '
        f'w:rsidR="00CC0000" w:rsidRDefault="00CC0000">'
        f'<w:pPr><w:pStyle w:val="Normal"/></w:pPr>'
        f'<w:r><w:br w:type="page"/></w:r>'
        f'</w:p>'
    )


# ── Inline formatting ─────────────────────────────────────────────────────────

def parse_inline(text):
    """Convert **bold** and *italic* to Word XML runs."""
    result = []
    pattern = re.compile(r'(\*\*([^*]+)\*\*|\*([^*\n]+)\*|([^*]+))')
    for m in pattern.finditer(text):
        if m.group(2):
            result.append(
                f'<w:r><w:rPr><w:b/><w:bCs/></w:rPr>'
                f'<w:t xml:space="preserve">{escape_xml(m.group(2))}</w:t></w:r>'
            )
        elif m.group(3):
            result.append(
                f'<w:r><w:rPr><w:i/><w:iCs/></w:rPr>'
                f'<w:t xml:space="preserve">{escape_xml(m.group(3))}</w:t></w:r>'
            )
        elif m.group(4):
            t = escape_xml(m.group(4))
            if t.strip():
                result.append(f'<w:r><w:t xml:space="preserve">{t}</w:t></w:r>')
    return ''.join(result)


# ── Table builder ─────────────────────────────────────────────────────────────

def parse_table_row(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]

def is_separator_row(row):
    return all(re.match(r'^[-:]+$', c) for c in row if c)

def make_table(rows):
    if not rows:
        return ''
    data_rows = [r for r in rows if not is_separator_row(r)]
    if not data_rows:
        return ''

    ncols = max(len(r) for r in data_rows)
    table_width = 9067
    col_w = table_width // ncols
    col_widths = [col_w] * ncols
    col_widths[-1] = table_width - col_w * (ncols - 1)
    col_grid = ''.join(f'<w:gridCol w:w="{w}"/>' for w in col_widths)

    border = (
        '<w:top w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '<w:left w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '<w:right w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
    )

    xml_rows = []
    for i, row in enumerate(data_rows):
        is_header = (i == 0)
        fill = 'D9E2F3' if is_header else 'FFFFFF'
        bold = '<w:b/><w:bCs/>' if is_header else ''
        cells = []
        for j in range(ncols):
            w = col_widths[j]
            cell_text = escape_xml(row[j].strip()) if j < len(row) else ''
            cells.append(
                f'<w:tc>'
                f'<w:tcPr>'
                f'<w:tcW w:w="{w}" w:type="dxa"/>'
                f'<w:shd w:val="clear" w:color="auto" w:fill="{fill}"/>'
                f'<w:vAlign w:val="center"/>'
                f'</w:tcPr>'
                f'<w:p><w:pPr><w:spacing w:after="80" w:line="278" w:lineRule="auto"/></w:pPr>'
                f'<w:r><w:rPr>{bold}<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>'
                f'<w:t xml:space="preserve">{cell_text}</w:t></w:r></w:p>'
                f'</w:tc>'
            )
        xml_rows.append('<w:tr>' + ''.join(cells) + '</w:tr>')

    spacer_pid = new_para_id()
    return (
        f'<w:tbl>'
        f'<w:tblPr>'
        f'<w:tblStyle w:val="TableGrid"/>'
        f'<w:tblW w:w="{table_width}" w:type="dxa"/>'
        f'<w:tblBorders>{border}</w:tblBorders>'
        f'<w:tblCellMar>'
        f'<w:top w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/>'
        f'<w:bottom w:w="80" w:type="dxa"/><w:right w:w="120" w:type="dxa"/>'
        f'</w:tblCellMar>'
        f'</w:tblPr>'
        f'<w:tblGrid>{col_grid}</w:tblGrid>'
        + ''.join(xml_rows) +
        f'</w:tbl>'
        f'<w:p w14:paraId="{spacer_pid}" w14:textId="77777777" '
        f'w:rsidR="00CC0000" w:rsidRDefault="00CC0000">'
        f'<w:pPr><w:spacing w:after="160" w:line="278" w:lineRule="auto"/></w:pPr>'
        f'</w:p>'
    )


# ── Main MD → XML converter ───────────────────────────────────────────────────

def convert_md_to_xml(md_text):
    lines = md_text.split('\n')
    xml_parts = []
    frontmatter_done = False
    table_buffer = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Skip H1 (title lives on cover page)
        if re.match(r'^# (?!#)', line):
            i += 1; continue

        # Skip horizontal rules
        if re.match(r'^---+\s*$', line.strip()):
            i += 1; continue

        # Skip frontmatter italic lines (version/date/status at top)
        if not frontmatter_done and re.match(r'^\*[^*].+\*\s*$', line.strip()):
            i += 1; continue

        if line.strip() and not re.match(r'^\*[^*]', line.strip()):
            frontmatter_done = True

        # H2 → Heading1
        if line.startswith('## '):
            if table_buffer:
                xml_parts.append(make_table(table_buffer)); table_buffer = []
            text = escape_xml(strip_numbering(line[3:].strip()))
            xml_parts.append(make_heading_para(text, 1))
            i += 1; continue

        # H3 → Heading2
        if line.startswith('### '):
            if table_buffer:
                xml_parts.append(make_table(table_buffer)); table_buffer = []
            text = escape_xml(strip_numbering(line[4:].strip()))
            xml_parts.append(make_heading_para(text, 2))
            i += 1; continue

        # H4 → Heading3
        if line.startswith('#### '):
            if table_buffer:
                xml_parts.append(make_table(table_buffer)); table_buffer = []
            text = escape_xml(strip_numbering(line[5:].strip()))
            xml_parts.append(make_heading_para(text, 3))
            i += 1; continue

        # Table row
        if line.startswith('|'):
            table_buffer.append(parse_table_row(line))
            i += 1; continue
        else:
            if table_buffer:
                xml_parts.append(make_table(table_buffer)); table_buffer = []

        # Bullet
        if line.startswith('- '):
            runs = parse_inline(line[2:].strip())
            if runs:
                xml_parts.append(make_bullet_para(runs))
            i += 1; continue

        # Empty line
        if not line.strip():
            i += 1; continue

        # Normal paragraph
        runs = parse_inline(line.strip())
        if runs:
            xml_parts.append(make_normal_para(runs))
        i += 1

    if table_buffer:
        xml_parts.append(make_table(table_buffer))

    return ''.join(xml_parts)


# ── DOCX read/write (stdlib zipfile) ─────────────────────────────────────────

def read_docx(path):
    """Extract all files from a DOCX into a dict {filename: bytes}."""
    files = {}
    with zipfile.ZipFile(path, 'r') as z:
        for name in z.namelist():
            files[name] = z.read(name)
    return files

def write_docx(path, files):
    """Write a dict of {filename: bytes} back to a DOCX file."""
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

def get_xml(files, entry):
    return files[entry].decode('utf-8')

def set_xml(files, entry, text):
    files[entry] = text.encode('utf-8')


# ── Document assembly ─────────────────────────────────────────────────────────

def convert(md_path: Path, template_path: Path, output_path: Path):
    # Load template
    files = read_docx(template_path)

    doc_entry = 'word/document.xml'
    if doc_entry not in files:
        raise FileNotFoundError("word/document.xml not found in template")

    doc = get_xml(files, doc_entry)

    # Verify template has expected TOC anchor
    if 'TOCHeading' not in doc:
        raise ValueError(
            "Could not find TOC in template (missing TOCHeading style).\n"
            "Make sure you are using the correct template file."
        )

    # Convert MD content to Word XML
    md_text = md_path.read_text(encoding='utf-8')
    new_content = convert_md_to_xml(md_text)

    # Find splice points:
    # - after the TOC SDT closing tag
    # - before the final section properties (must stay at end)
    toc_end = doc.find('</w:sdt>', doc.find('TOCHeading')) + len('</w:sdt>')
    sect_pos = doc.rfind('<w:sectPr')

    if toc_end <= 0 or sect_pos <= 0:
        raise ValueError("Could not locate splice points in document.xml.")

    new_doc = (
        doc[:toc_end]
        + make_page_break()
        + new_content
        + doc[sect_pos:]
    )

    set_xml(files, doc_entry, new_doc)
    write_docx(output_path, files)
    print(f"✓  {output_path}")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)

    md_path       = Path(sys.argv[1])
    template_path = Path(sys.argv[2])
    output_path   = Path(sys.argv[3])

    for p in (md_path, template_path):
        if not p.exists():
            print(f"Error: file not found: {p}")
            sys.exit(1)

    convert(md_path, template_path, output_path)
